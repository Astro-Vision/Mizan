import { describe, expect, it } from "vitest"
import {
  FUNDS_COMMITTED_TOPIC,
  FUNDS_TRANSFERRED_TOPIC,
  parseFundingEvent,
} from "./vault"

const topic = (value: string) => `0x${value.padStart(64, "0")}`
const word = (value: bigint) => value.toString(16).padStart(64, "0")

describe("parseFundingEvent", () => {
  it("decodes the milestone vault FundsCommitted event", () => {
    const event = parseFundingEvent({
      topics: [FUNDS_COMMITTED_TOPIC, topic("7"), topic("1"), `0x${"ab".repeat(20)}`],
      data: `0x${word(BigInt("12"))}${word(BigInt("20"))}`,
    })

    expect(event).toEqual({
      kind: "committed",
      campaignId: "7",
      funder: `0x${"ab".repeat(20)}`,
      amountWei: "12",
    })
  })

  it("keeps compatibility with the legacy FundsTransferred event", () => {
    const recipient = `0x${"cd".repeat(20)}`
    const event = parseFundingEvent({
      topics: [FUNDS_TRANSFERRED_TOPIC, topic("7"), topic("1"), `0x${"ab".repeat(20)}`],
      data: `0x${word(BigInt(`0x${recipient.slice(2)}`))}${word(BigInt("12"))}${word(BigInt("20"))}`,
    })

    expect(event).toMatchObject({
      kind: "transferred",
      campaignId: "7",
      recipient,
      amountWei: "12",
    })
  })
})
