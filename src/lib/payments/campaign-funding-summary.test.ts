import { describe, expect, it } from "vitest"

import { summarizeConfirmedPayments } from "./campaign-funding-summary"

describe("summarizeConfirmedPayments", () => {
  it("sums only CONFIRMED payments and counts unique donors", () => {
    const summary = summarizeConfirmedPayments([
      { amountWei: "1000000000000000000", donorId: 1, status: "CONFIRMED" },
      { amountWei: "500000000000000000", donorId: 1, status: "CONFIRMED" },
      { amountWei: "2000000000000000000", donorId: 2, status: "PENDING" },
      { amountWei: "300000000000000000", donorId: 3, status: "FAILED" },
    ])

    expect(summary.raisedAmountWei).toBe("1500000000000000000")
    expect(summary.donorCount).toBe(1)
  })
})
