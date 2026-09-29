"use client"

import { useRef, useState } from "react"
import { Download, FileText, Loader2, Upload } from "lucide-react"

import { decimalBnbToWei } from "@/src/lib/payments/validation"
import { useLanguage } from "@/components/site/language-provider"

type Props = {
  milestoneId: number
  milestoneDescription: string
  currency: string
}

export function DisbursementRequestForm({
  milestoneId,
  milestoneDescription,
  currency,
}: Props) {
  const { t } = useLanguage()
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [region, setRegion] = useState("Indonesia")
  const [itemName, setItemName] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [unit, setUnit] = useState("unit")
  const [unitPrice, setUnitPrice] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState<"download" | "submit" | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const getPayload = () => {
    const requestedAmountWei = decimalBnbToWei(amount)
    const unitPriceWei = decimalBnbToWei(unitPrice)
    const parsedQuantity = Number(quantity)
    if (
      !requestedAmountWei ||
      !unitPriceWei ||
      !itemName.trim() ||
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      throw new Error(
        t("Lengkapi nominal dan rincian item dengan format yang valid.")
      )
    }
    return {
      milestoneId,
      requestedAmountWei,
      description,
      region,
      items: [
        {
          name: itemName.trim(),
          quantity: parsedQuantity,
          unit: unit.trim() || "unit",
          unitPriceWei,
        },
      ],
    }
  }

  const downloadTemplate = async () => {
    setBusy("download")
    setMessage(null)
    try {
      const response = await fetch("/api/beneficiary/disbursements/document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getPayload()),
      })
      if (!response.ok) {
        const result = (await response.json()) as { error?: string }
        throw new Error(result.error || t("Template gagal dibuat."))
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = `pengajuan-pencairan-${milestoneId}.docx`
      anchor.click()
      URL.revokeObjectURL(url)
      setMessage(
        t(
          "Template berhasil diunduh. Tanda tangani dokumen lalu upload kembali."
        )
      )
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : t("Template gagal dibuat.")
      )
    } finally {
      setBusy(null)
    }
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy("submit")
    setMessage(null)
    try {
      const payload = getPayload()
      if (!file)
        throw new Error(
          t("Upload dokumen PDF atau DOCX yang sudah ditandatangani.")
        )
      const formData = new FormData()
      formData.append("milestoneId", String(payload.milestoneId))
      formData.append("requestedAmountWei", payload.requestedAmountWei)
      formData.append("description", payload.description)
      formData.append("region", payload.region)
      formData.append("items", JSON.stringify(payload.items))
      formData.append("document", file)
      const response = await fetch("/api/beneficiary/disbursements", {
        method: "POST",
        body: formData,
      })
      const result = (await response.json()) as {
        error?: string
        status?: string
      }
      if (!response.ok)
        throw new Error(result.error || t("Pengajuan gagal diproses."))
      setMessage(
        `${t("Pengajuan berhasil diproses dengan status")} ${result.status}.`
      )
      setFile(null)
      if (inputRef.current) inputRef.current.value = ""
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : t("Pengajuan gagal diproses.")
      )
    } finally {
      setBusy(null)
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mt-5 rounded-2xl border border-brand-200 bg-brand-50/40 p-5"
    >
      <div className="flex items-start gap-3">
        <FileText className="mt-0.5 size-5 text-brand-700" />
        <div>
          <h3 className="font-semibold text-ink">
            {t("Dokumen pengajuan pencairan")}
          </h3>
          <p className="mt-1 text-xs leading-5 text-ink-muted">
            {milestoneDescription}.{" "}
            {t(
              "Isi rincian, unduh template, tanda tangani, lalu upload PDF atau DOCX."
            )}
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium text-ink">
          {t("Nominal")} ({currency})
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.5"
            className="mt-1.5 h-10 w-full rounded-lg border border-line-ui bg-surface px-3 text-sm"
          />
        </label>
        <label className="text-xs font-medium text-ink">
          {t("Wilayah pembelian")}
          <input
            value={region}
            onChange={(event) => setRegion(event.target.value)}
            className="mt-1.5 h-10 w-full rounded-lg border border-line-ui bg-surface px-3 text-sm"
          />
        </label>
      </div>
      <label className="mt-3 block text-xs font-medium text-ink">
        {t("Deskripsi penggunaan dana")}
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          className="mt-1.5 w-full rounded-lg border border-line-ui bg-surface px-3 py-2 text-sm"
        />
      </label>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_90px_110px_1fr]">
        <label className="text-xs font-medium text-ink">
          Item
          <input
            value={itemName}
            onChange={(event) => setItemName(event.target.value)}
            placeholder="Beras"
            className="mt-1.5 h-10 w-full rounded-lg border border-line-ui bg-surface px-3 text-sm"
          />
        </label>
        <label className="text-xs font-medium text-ink">
          Jumlah
          <input
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            className="mt-1.5 h-10 w-full rounded-lg border border-line-ui bg-surface px-3 text-sm"
          />
        </label>
        <label className="text-xs font-medium text-ink">
          Satuan
          <input
            value={unit}
            onChange={(event) => setUnit(event.target.value)}
            className="mt-1.5 h-10 w-full rounded-lg border border-line-ui bg-surface px-3 text-sm"
          />
        </label>
        <label className="text-xs font-medium text-ink">
          Harga satuan ({currency})
          <input
            value={unitPrice}
            onChange={(event) => setUnitPrice(event.target.value)}
            placeholder="0.25"
            className="mt-1.5 h-10 w-full rounded-lg border border-line-ui bg-surface px-3 text-sm"
          />
        </label>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-line-ui bg-surface px-3 text-xs font-medium text-ink">
          <Upload className="size-4" />
          {file ? file.name : "Pilih PDF/DOCX bertanda tangan"}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="sr-only"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadTemplate}
            disabled={busy !== null}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-brand-300 px-3 text-xs font-semibold text-brand-700 disabled:opacity-50"
          >
            {busy === "download" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Unduh template
          </button>
          <button
            type="submit"
            disabled={busy !== null}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-700 px-3 text-xs font-semibold text-white disabled:opacity-50"
          >
            {busy === "submit" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : null}
            Kirim untuk dianalisis
          </button>
        </div>
      </div>
      {message ? (
        <p className="mt-3 text-xs text-ink-muted" role="status">
          {message}
        </p>
      ) : null}
    </form>
  )
}
