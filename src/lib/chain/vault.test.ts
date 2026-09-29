import { describe, expect, it } from "vitest"
import { encodeFundCampaign, isCampaignChainReady } from "./vault"

describe("campaign chain policy", () => {
  it("encodes and validates the registered campaign, not its database id", () => {
    expect(encodeFundCampaign("42")).toMatch(/2a$/)
    expect(
      isCampaignChainReady({ active: true, recipient: "0xABC" }, "0xabc")
    ).toBe(true)
  })
})
