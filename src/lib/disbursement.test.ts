import { describe, expect, it } from "vitest"

import {
  disbursementRequestInputSchema,
  isPublicDisbursementStatus,
  validateDisbursementDocument,
  validateDisbursementDocumentFile,
} from "./disbursement"

describe("disbursement request validation", () => {
  it("accepts a request whose item totals equal the requested amount", () => {
    const result = disbursementRequestInputSchema.safeParse({
      requestedAmountWei: "1500000000000000000",
      description: "Pembelian paket sembako",
      region: "Bandung",
      items: [
        { name: "Beras", quantity: 2, unit: "karung", unitPriceWei: "500000000000000000" },
        { name: "Minyak", quantity: 1, unit: "botol", unitPriceWei: "500000000000000000" },
      ],
    })

    expect(result.success).toBe(true)
  })

  it("rejects a request with a mismatched item total", () => {
    const result = disbursementRequestInputSchema.safeParse({
      requestedAmountWei: "1500000000000000000",
      description: "Pembelian paket sembako",
      region: "Indonesia",
      items: [{ name: "Beras", quantity: 2, unit: "karung", unitPriceWei: "500000000000000000" }],
    })

    expect(result.success).toBe(false)
  })

  it("exposes only disbursed requests as public history", () => {
    expect(isPublicDisbursementStatus("DISBURSED")).toBe(true)
    expect(isPublicDisbursementStatus("PROOF_SUBMITTED")).toBe(false)
    expect(isPublicDisbursementStatus("REJECTED")).toBe(false)
  })

  it("rejects a PDF MIME type with a non-PDF filename", () => {
    const file = new File(["document"], "request.exe", { type: "application/pdf" })
    expect(validateDisbursementDocument(file)).toContain("ekstensi")
  })

  it("rejects a PDF with a forged MIME type and extension", async () => {
    const file = new File(["not a pdf"], "request.pdf", { type: "application/pdf" })
    await expect(validateDisbursementDocumentFile(file)).resolves.toContain("Isi")
  })
})
