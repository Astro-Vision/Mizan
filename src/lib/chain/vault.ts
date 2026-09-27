const DEFAULT_RPC_URL = "https://data-seed-prebsc-1-s1.bnbchain.org:8545"
const VAULT_ADDRESS = "0xE8e0eE10f620464d9CD475c6A2Ba9dC13B9623de"
const DEMO_CAMPAIGN_ID = "804936431"
// The selector is unchanged across contract versions. The milestone contract
// returns the full seven-field campaign state tuple.
const GET_CAMPAIGN_STATE_SELECTOR = "0x25733cfe"
const WEI_PER_BNB = BigInt("1000000000000000000")
export const BSC_TESTNET_CHAIN_ID = 97
export const FUND_CAMPAIGN_SELECTOR = "0x92bd38bc"
export const FUNDS_COMMITTED_TOPIC =
  "0xe72af613afdcb3fe47a74607156d56e5df709549b16af489b7ad68f85818e132"
export const FUNDS_TRANSFERRED_TOPIC =
  "0x9e7e670dfaf0c6118e2929a9e97c2388d37975b64297543c14f2a67b53454022"

export type FundingEventLog = { topics?: string[]; data?: string }

export function parseFundingEvent(log: FundingEventLog) {
  const topics = log.topics ?? []
  if (topics.length < 4 || !log.data) return null

  try {
    const topic = topics[0].toLowerCase()
    const campaignId = BigInt(topics[1]).toString()
    const funder = `0x${topics[3].slice(-40)}`.toLowerCase()

    if (topic === FUNDS_COMMITTED_TOPIC) {
      if (log.data.length < 130) return null
      return {
        kind: "committed" as const,
        campaignId,
        funder,
        amountWei: BigInt(`0x${wordAt(log.data, 0)}`).toString(),
      }
    }

    if (topic === FUNDS_TRANSFERRED_TOPIC) {
      if (log.data.length < 194) return null
      return {
        kind: "transferred" as const,
        campaignId,
        funder,
        recipient: `0x${wordAt(log.data, 0).slice(-40)}`.toLowerCase(),
        amountWei: BigInt(`0x${wordAt(log.data, 1)}`).toString(),
      }
    }
  } catch {
    return null
  }

  return null
}

export type CampaignChainState = {
  vaultAddress: string
  campaignId: string
  recipient: string
  targetAmount: bigint
  fundedAmount: bigint
  contributionCount: bigint
  releasedAmount: bigint
  reservedAmount: bigint
  availableAmount: bigint
  active: boolean
  explorerUrl: string
}

type RpcResponse = {
  result?: string
  error?: { message?: string }
}

function uint256(value: bigint) {
  return value.toString(16).padStart(64, "0")
}

function wordAt(data: string, index: number) {
  const start = 2 + index * 64
  return data.slice(start, start + 64)
}

function wordToBigInt(word: string) {
  return BigInt(`0x${word}`)
}

function wordToAddress(word: string) {
  return `0x${word.slice(24)}`
}

export function formatBnb(value: bigint) {
  const whole = value / WEI_PER_BNB
  const fraction = value % WEI_PER_BNB
  const decimals = fraction.toString().padStart(18, "0").slice(0, 4)
  return `${whole}.${decimals}`.replace(/\.?0+$/, "")
}

export function getConfiguredVaultAddress() {
  return process.env.MIZAN_CONTRACT_ADDRESS || VAULT_ADDRESS
}

export function encodeFundCampaign(campaignId: string) {
  if (!/^\d+$/.test(campaignId)) throw new Error("Campaign ID tidak valid")
  return `${FUND_CAMPAIGN_SELECTOR}${uint256(BigInt(campaignId))}`
}

export async function getDemoCampaignState(): Promise<CampaignChainState> {
  const rpcUrl = process.env.BSC_TESTNET_RPC_URL || DEFAULT_RPC_URL
  const campaignId = BigInt(process.env.MIZAN_DEMO_CAMPAIGN_ID || DEMO_CAMPAIGN_ID)
  const vaultAddress = getConfiguredVaultAddress()
  const calldata = `${GET_CAMPAIGN_STATE_SELECTOR}${uint256(campaignId)}`

  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_call",
      params: [{ to: vaultAddress, data: calldata }, "latest"],
    }),
    next: { revalidate: 15 },
  })

  if (!response.ok) throw new Error(`BSC RPC gagal: HTTP ${response.status}`)

  const payload = (await response.json()) as RpcResponse
  if (payload.error || !payload.result || payload.result === "0x") {
    throw new Error(payload.error?.message || "getCampaignState gagal")
  }

  const wordCount = (payload.result.length - 2) / 64
  if (wordCount >= 7) {
    return {
      vaultAddress,
      campaignId: campaignId.toString(),
      recipient: wordToAddress(wordAt(payload.result, 0)),
      targetAmount: wordToBigInt(wordAt(payload.result, 1)),
      fundedAmount: wordToBigInt(wordAt(payload.result, 2)),
      contributionCount: BigInt(0),
      releasedAmount: wordToBigInt(wordAt(payload.result, 3)),
      reservedAmount: wordToBigInt(wordAt(payload.result, 4)),
      availableAmount: wordToBigInt(wordAt(payload.result, 5)),
      active: wordToBigInt(wordAt(payload.result, 6)) === BigInt(1),
      explorerUrl: `https://testnet.bscscan.com/address/${vaultAddress}`,
    }
  }

  if (wordCount < 5) throw new Error("getCampaignState mengembalikan tuple tidak dikenal")

  return {
    vaultAddress,
    campaignId: campaignId.toString(),
    recipient: wordToAddress(wordAt(payload.result, 0)),
    targetAmount: wordToBigInt(wordAt(payload.result, 1)),
    fundedAmount: wordToBigInt(wordAt(payload.result, 2)),
    contributionCount: wordToBigInt(wordAt(payload.result, 3)),
    releasedAmount: BigInt(0),
    reservedAmount: BigInt(0),
    availableAmount: wordToBigInt(wordAt(payload.result, 2)),
    active: wordToBigInt(wordAt(payload.result, 4)) === BigInt(1),
    explorerUrl: `https://testnet.bscscan.com/address/${vaultAddress}`,
  }
}
