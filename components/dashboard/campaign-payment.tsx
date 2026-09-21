"use client"

import * as React from "react"
import { useIdentityToken, useWallets } from "@privy-io/react-auth"
import { cn } from "@/src/lib/utils"
import { BSC_TESTNET_CHAIN_ID, encodeFundCampaign } from "@/src/lib/chain/vault"
import { decimalBnbToWei } from "@/src/lib/payments/validation"

export type PaymentCampaign = {
  id: string
  judul: string
  penyelenggara: string
  targetAmountWei: string
  recipientWallet: string | null
}

export function CampaignPayment({ campaigns }: { campaigns: PaymentCampaign[] }) {
  const { identityToken } = useIdentityToken()
  const { wallets, ready: walletsReady } = useWallets()
  const [campaignId, setCampaignId] = React.useState(campaigns[0]?.id ?? "")
  const [amount, setAmount] = React.useState("")
  const [mode, setMode] = React.useState<"MOCK" | "ONCHAIN">("MOCK")
  const [message, setMessage] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [totalFundedWei, setTotalFundedWei] = React.useState<Record<string, string>>({})
  const ethereumWallet = wallets.find((wallet) => wallet.type === "ethereum")

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    if (!identityToken || !ethereumWallet) {
      setMessage("Login dan wallet Ethereum diperlukan untuk membayar.")
      return
    }

    const amountWei = decimalBnbToWei(amount)
    if (!amountWei || amountWei === "0") {
      setMessage("Nominal BNB tidak valid. Gunakan maksimal 18 angka desimal.")
      return
    }
    const campaign = campaigns.find((item) => item.id === campaignId)
    if (!campaign) {
      setMessage("Pilih campaign terlebih dahulu.")
      return
    }

    setBusy(true)
    const idempotencyKey = crypto.randomUUID()
    try {
      if (mode === "MOCK") {
        const response = await fetch("/api/payments/mock", {
          method: "POST",
          headers: { "content-type": "application/json", "privy-id-token": identityToken },
          body: JSON.stringify({
            campaignId,
            donorWallet: ethereumWallet.address,
            amountWei,
            idempotencyKey,
          }),
        })
        const body = (await response.json()) as {
          ok?: boolean
          error?: string
          totalFundedWei?: string
        }
        if (!response.ok || !body.ok) throw new Error(body.error || "Mock payment gagal")
        if (body.totalFundedWei) {
          setTotalFundedWei((current) => ({ ...current, [campaignId]: body.totalFundedWei! }))
        }
        setMessage("Mock payment berhasil dicatat.")
      } else {
        const contractAddress = process.env.NEXT_PUBLIC_MIZAN_CONTRACT_ADDRESS
        if (!contractAddress) throw new Error("Contract v2 belum dikonfigurasi di client")
        await ethereumWallet.switchChain(BSC_TESTNET_CHAIN_ID)
        const provider = await ethereumWallet.getEthereumProvider()
        const activeChainId = await provider.request({ method: "eth_chainId" })
        if (activeChainId !== "0x61") {
          throw new Error("Wallet belum berada di BSC Testnet. Switch network lalu coba lagi.")
        }
        const hash = await provider.request({
          method: "eth_sendTransaction",
          params: [
            {
              from: ethereumWallet.address,
              to: contractAddress,
              data: encodeFundCampaign(campaignId),
              value: `0x${BigInt(amountWei).toString(16)}`,
            },
          ],
        }) as `0x${string}`
        const response = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "content-type": "application/json", "privy-id-token": identityToken },
          body: JSON.stringify({
            campaignId,
            donorWallet: ethereumWallet.address,
            amountWei,
            idempotencyKey,
            transactionHash: hash,
          }),
        })
        const body = (await response.json()) as {
          ok?: boolean
          error?: string
          status?: string
          totalFundedWei?: string
        }
        if (!response.ok && response.status !== 202) {
          throw new Error(body.error || "Konfirmasi on-chain gagal")
        }
        if (body.totalFundedWei) {
          setTotalFundedWei((current) => ({ ...current, [campaignId]: body.totalFundedWei! }))
        }
        setMessage(body.status === "PENDING" ? "Transaksi menunggu konfirmasi." : `Payment terkonfirmasi: ${hash}`)
      }
      setAmount("")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Payment gagal")
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="rounded-2xl border border-line-soft bg-surface p-5 sm:p-6">
      <p className="mz-overline">Payment</p>
      <h2 className="mt-2 text-h3 text-ink">Dukung campaign aktif</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Simulasi tersimpan di database tanpa blockchain. On-chain memakai BSC Testnet dan saldo tBNB.
      </p>

      {campaigns.length === 0 ? (
        <p className="mt-5 rounded-xl border border-line-soft bg-surface-sunken p-4 text-sm text-ink-muted">
          Belum ada campaign aktif yang siap menerima payment.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-ink">
            Campaign
            <select
              value={campaignId}
              onChange={(event) => setCampaignId(event.target.value)}
              className="mt-1.5 h-12 w-full rounded-[6px] border border-line-ui bg-surface px-4 text-sm text-ink outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
            >
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.judul} — {campaign.penyelenggara}
                </option>
              ))}
            </select>
          </label>

          <p className="rounded-lg bg-surface-sunken px-3 py-2 text-xs text-ink-muted">
            Saldo campaign terkonfirmasi: {formatBnbWei(totalFundedWei[campaignId] ?? "0")} BNB
          </p>

          <label className="block text-sm font-medium text-ink">
            Nominal (BNB)
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              placeholder="0.01"
              className="mt-1.5 h-12 w-full rounded-[6px] border border-line-ui bg-surface px-4 font-mono text-sm text-ink outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <div className="grid grid-cols-2 gap-2">
            {(["MOCK", "ONCHAIN"] as const).map((paymentMode) => (
              <button
                key={paymentMode}
                type="button"
                onClick={() => setMode(paymentMode)}
                className={cn(
                  "h-10 rounded-[6px] border text-xs font-semibold",
                  mode === paymentMode
                    ? "border-brand-700 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                    : "border-line-soft text-ink-muted",
                )}
              >
                  {paymentMode === "MOCK" ? "Simulasi DB" : "On-chain BSC Testnet"}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={busy || !walletsReady}
            className="inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-brand-700 px-6 text-sm font-medium text-white hover:bg-brand-600 disabled:pointer-events-none disabled:opacity-50"
          >
            {busy ? "Memproses…" : mode === "MOCK" ? "Bayar simulasi" : "Bayar dengan wallet"}
          </button>
        </form>
      )}

      {message ? (
        <p className="mt-4 rounded-xl border border-line-soft bg-surface-sunken p-3 text-sm text-ink" role="status">
          {message}
        </p>
      ) : null}
    </section>
  )
}

function formatBnbWei(value: string) {
  const wei = BigInt(value)
  const whole = wei / BigInt("1000000000000000000")
  const fraction = wei % BigInt("1000000000000000000")
  const decimals = fraction.toString().padStart(18, "0").slice(0, 4)
  return `${whole}.${decimals}`.replace(/\.?0+$/, "")
}
