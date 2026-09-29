import { afterEach, describe, expect, it, vi } from "vitest"
import {
  FUNDS_TRANSFERRED_TOPIC,
  encodeFundCampaign,
  getCampaignState,
  isCampaignChainReady,
} from "./vault"

const word = (value: bigint) => value.toString(16).padStart(64, "0")

describe("campaign chain policy", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it("encodes and validates the registered campaign, not its database id", () => {
    expect(encodeFundCampaign("42")).toBe(
      `0x92bd38bc${word(BigInt(42))}`
    )
    expect(
      isCampaignChainReady({ active: true, recipient: "0xABC" }, "0xabc")
    ).toBe(true)
    expect(
      isCampaignChainReady({ active: false, recipient: "0xABC" }, "0xabc")
    ).toBe(false)
    expect(
      isCampaignChainReady({ active: true, recipient: "0xABC" }, "0xdef")
    ).toBe(false)
    expect(() => encodeFundCampaign("-1")).toThrow("Campaign ID tidak valid")
  })

  it("decodes the exact v2 campaign tuple returned by BSC RPC", async () => {
    const recipient = "1234567890abcdef1234567890abcdef12345678"
    const result = `0x${word(BigInt(`0x${recipient}`))}${word(BigInt(100))}${word(BigInt(25))}${word(BigInt(2))}${word(BigInt(1))}`
    vi.stubEnv("MIZAN_CONTRACT_ADDRESS", "0x1111111111111111111111111111111111111111")
    vi.stubEnv("BSC_TESTNET_RPC_URL", "https://rpc.example")
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), {
          status: 200,
          headers: { "content-type": "application/json" },
        })
      )
    )

    const state = await getCampaignState("42")

    expect(state).toMatchObject({
      campaignId: "42",
      recipient: `0x${recipient}`,
      targetAmount: BigInt(100),
      fundedAmount: BigInt(25),
      contributionCount: BigInt(2),
      availableAmount: BigInt(25),
      active: true,
    })
    expect(fetch).toHaveBeenCalledWith(
      "https://rpc.example",
      expect.objectContaining({ method: "POST", cache: "no-store" })
    )
  })

  it("uses the deployed FundsTransferred event signature", () => {
    expect(FUNDS_TRANSFERRED_TOPIC).toBe(
      "0x9e7e670dfaf0c6118e2929a9e97c2388d37975b64297543c14f2a67b53454022"
    )
  })
})
