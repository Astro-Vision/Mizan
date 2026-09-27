export type PaymentFundingRow = {
  amountWei: string
  donorId: number
  status: "PENDING" | "CONFIRMED" | "FAILED"
}

/** Pure rollup used by sync + tests. */
export function summarizeConfirmedPayments(payments: PaymentFundingRow[]) {
  const confirmed = payments.filter((payment) => payment.status === "CONFIRMED")
  return {
    raisedAmountWei: confirmed
      .reduce((total, payment) => total + BigInt(payment.amountWei), BigInt(0))
      .toString(),
    donorCount: new Set(confirmed.map((payment) => payment.donorId)).size,
  }
}
