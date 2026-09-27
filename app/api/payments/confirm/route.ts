import { NextResponse } from "next/server"
import { z } from "zod"
import {
  FUNDS_TRANSFERRED_TOPIC,
  getConfiguredVaultAddress,
} from "@/src/lib/chain/vault"
import { getPrivyProfile } from "@/src/lib/privy/user-data"
import { getPrivyUserFromIdentityToken } from "@/src/lib/privy/server"
import { db } from "@/src/prisma/db"

const inputSchema = z.object({
  campaignId: z.coerce.number().int().positive(),
  donorWallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  amountWei: z.string().regex(/^[1-9]\d*$/),
  idempotencyKey: z.string().trim().min(8).max(120),
  transactionHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
})

type RpcLog = { address?: string; topics?: string[]; data?: string }
type RpcReceipt = { status?: string; to?: string; logs?: RpcLog[] }

export async function POST(request: Request) {
  try {
    const identityToken = request.headers.get("privy-id-token")
    if (!identityToken) return error("IDENTITY_TOKEN_REQUIRED", 401)

    const input = inputSchema.parse(await request.json())
    const privyUser = await getPrivyUserFromIdentityToken(identityToken)
    const profile = getPrivyProfile(privyUser)
    const donorWallet = input.donorWallet.toLowerCase()
    if (
      !profile.wallets.some(
        (wallet) =>
          wallet.chainType === "ethereum" && wallet.address === donorWallet
      )
    ) {
      return error("WALLET_NOT_LINKED", 403)
    }

    const user = await db.orm.public.User.where({
      privyId: profile.privyId,
    }).first()
    if (!user) return error("USER_NOT_SYNCED", 404)

    const campaign = await db.orm.public.Campaign.first({
      id: input.campaignId,
    })
    if (!campaign) return error("CAMPAIGN_NOT_FOUND", 404)
    if (campaign.reviewStatus !== "APPROVED" || campaign.status !== "ACTIVE") {
      return error("CAMPAIGN_NOT_ACTIVE", 409)
    }

    const existing = await db.orm.public.CampaignPayment.first({
      idempotencyKey: input.idempotencyKey,
    })
    if (existing) {
      if (existing.transactionHash !== input.transactionHash) {
        return error("IDEMPOTENCY_KEY_REUSED", 409)
      }
      return NextResponse.json({
        ok: true,
        payment: serializePayment(existing),
        idempotent: true,
      })
    }

    const wallet = await db.orm.public.UserWallet.where({
      userId: user.id,
      address: donorWallet,
      chainType: "ethereum",
    }).first()
    if (!wallet) return error("WALLET_NOT_SYNCED", 409)

    const receipt = await readReceipt(input.transactionHash)
    if (!receipt) {
      return NextResponse.json(
        { ok: false, status: "PENDING", error: "TRANSACTION_NOT_MINED" },
        { status: 202 }
      )
    }
    if (receipt.status !== "0x1") return error("TRANSACTION_FAILED", 422)
    if (
      receipt.to?.toLowerCase() !== getConfiguredVaultAddress().toLowerCase()
    ) {
      return error("WRONG_CONTRACT", 422)
    }

    const event = receipt.logs?.find(
      (log) =>
        log.address?.toLowerCase() ===
          getConfiguredVaultAddress().toLowerCase() &&
        log.topics?.[0]?.toLowerCase() === FUNDS_TRANSFERRED_TOPIC
    )
    if (
      !event?.topics ||
      event.topics.length < 4 ||
      !event.data ||
      event.data.length < 194
    ) {
      return error("FUNDING_EVENT_NOT_FOUND", 422)
    }

    const eventCampaignId = BigInt(event.topics[1]).toString()
    const eventFunder = `0x${event.topics[3].slice(-40)}`.toLowerCase()
    const eventRecipient = `0x${wordAt(event.data, 0).slice(-40)}`.toLowerCase()
    const eventAmountWei = BigInt(`0x${wordAt(event.data, 1)}`).toString()
    if (
      eventCampaignId !== String(input.campaignId) ||
      eventFunder !== donorWallet ||
      eventRecipient !== campaign.recipientWallet?.toLowerCase() ||
      eventAmountWei !== input.amountWei
    ) {
      return error("FUNDING_EVENT_MISMATCH", 422)
    }

    const payment = await db.orm.public.CampaignPayment.create({
      campaignId: input.campaignId,
      donorId: user.id,
      donorWallet,
      amountWei: input.amountWei,
      mode: "ONCHAIN",
      status: "CONFIRMED",
      transactionHash: input.transactionHash,
      idempotencyKey: input.idempotencyKey,
    })
    return NextResponse.json({
      ok: true,
      payment: serializePayment(payment),
      totalFundedWei: await getCampaignTotalWei(input.campaignId),
    })
  } catch (error) {
    if (error instanceof z.ZodError)
      return errorResponse("INVALID_PAYMENT", 422)
    console.error("On-chain payment confirmation failed", error)
    return errorResponse("ONCHAIN_CONFIRM_FAILED", 500)
  }
}

async function readReceipt(transactionHash: string) {
  const response = await fetch(
    process.env.BSC_TESTNET_RPC_URL ||
      "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getTransactionReceipt",
        params: [transactionHash],
      }),
      cache: "no-store",
    }
  )
  if (!response.ok) throw new Error(`BSC RPC gagal: HTTP ${response.status}`)
  const payload = (await response.json()) as {
    result?: RpcReceipt | null
    error?: { message?: string }
  }
  if (payload.error)
    throw new Error(payload.error.message || "Receipt RPC gagal")
  return payload.result ?? null
}

async function getCampaignTotalWei(campaignId: number) {
  const payments = await db.orm.public.CampaignPayment.where({
    campaignId,
  }).all()
  return payments
    .filter((payment) => payment.status === "CONFIRMED")
    .reduce((total, payment) => total + BigInt(payment.amountWei), BigInt(0))
    .toString()
}

function wordAt(data: string, index: number) {
  const start = 2 + index * 64
  return data.slice(start, start + 64)
}

function serializePayment(payment: {
  id: number
  campaignId: number
  amountWei: string
  mode: "MOCK" | "ONCHAIN"
  status: "PENDING" | "CONFIRMED" | "FAILED"
  transactionHash: string | null
  idempotencyKey: string
}) {
  return {
    id: payment.id,
    campaignId: payment.campaignId,
    amountWei: payment.amountWei,
    mode: payment.mode,
    status: payment.status,
    transactionHash: payment.transactionHash,
    idempotencyKey: payment.idempotencyKey,
  }
}

function error(code: string, status: number) {
  return errorResponse(code, status)
}

function errorResponse(code: string, status: number) {
  return NextResponse.json({ ok: false, error: code }, { status })
}
