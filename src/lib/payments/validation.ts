export function decimalBnbToWei(value: string) {
  const match = value.trim().match(/^(\d+)(?:\.(\d{1,18}))?$/)
  if (!match) return null

  return (
    BigInt(match[1]) * BigInt("1000000000000000000") +
    BigInt((match[2] ?? "").padEnd(18, "0") || "0")
  ).toString()
}
