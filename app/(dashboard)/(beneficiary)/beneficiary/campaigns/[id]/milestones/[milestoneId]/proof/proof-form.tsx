"use client"

import { useActionState, useState } from "react"
import { Upload, Loader2, FileText } from "lucide-react"
import { submitProof } from "./actions"

type ProofResult = { success: boolean; message: string } | null

export function ProofForm({
  milestoneId,
}: {
  milestoneId: string
}) {
  const [preview, setPreview] = useState<{ url: string; isPdf: boolean } | null>(null)

  const action = async (_prev: ProofResult, formData: FormData) => {
    return submitProof(milestoneId, formData)
  }

  const [state, formAction, isPending] = useActionState(action, null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && (file.type.startsWith("image/") || file.type === "application/pdf")) {
      const url = URL.createObjectURL(file)
      setPreview({ url, isPdf: file.type === "application/pdf" })
    } else {
      setPreview(null)
    }
  }

  return (
    <form action={formAction} className="mt-8 space-y-6">
      {/* Result message */}
      {state && (
        <div
          className={`rounded-[10px] border p-4 text-sm ${
            state.success
              ? "border-brand-200 bg-brand-50 text-brand-700"
              : "border-coral/40 bg-coral/10 text-ink"
          }`}
        >
          {state.message}
        </div>
      )}

      {/* File input */}
      <label className="block text-sm font-medium text-ink">
        File bukti
        <div className="relative mt-2">
          <input
            name="proofFile"
            type="file"
            accept="image/*,.pdf,application/pdf"
            required
            disabled={isPending}
            onChange={handleFileChange}
            className="block min-h-12 w-full rounded-[6px] border border-line-ui bg-surface px-3 py-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-700 disabled:opacity-50"
          />
        </div>
        <span className="mt-2 block text-xs text-ink-muted">
          Upload gambar kuitansi/dokumentasi atau file PDF. Maks 5 MB.
        </span>
      </label>

      {/* Image preview */}
      {preview && !preview.isPdf && (
        <div className="overflow-hidden rounded-[10px] border border-line-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.url}
            alt="Preview bukti"
            className="w-full object-contain"
            style={{ maxHeight: 320 }}
          />
        </div>
      )}
      {preview?.isPdf && (
        <div className="flex items-center gap-3 rounded-[10px] border border-line-soft bg-surface-sunken p-4 text-sm text-ink-muted">
          <FileText size={20} strokeWidth={1.5} />
          PDF siap diunggah: {" "}
          <span className="font-medium text-ink">dokumen bukti penggunaan dana</span>
        </div>
      )}

      {/* Note textarea */}
      <label className="block text-sm font-medium text-ink">
        Catatan penggunaan dana
        <textarea
          name="proofNote"
          rows={4}
          disabled={isPending}
          className="mt-2 w-full rounded-[6px] border border-line-ui bg-surface px-4 py-3 text-sm disabled:opacity-50"
          placeholder="Jelaskan kapan dan kepada siapa dana disalurkan."
        />
      </label>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-12 items-center gap-2 rounded-[10px] bg-brand-700 px-5 text-sm font-medium text-white transition-colors hover:bg-brand-800 disabled:opacity-50"
      >
        {isPending ? (
          <>
            <Loader2 size={18} strokeWidth={1.5} className="animate-spin" />
            Mengunggah dan memverifikasi…
          </>
        ) : (
          <>
            <Upload size={18} strokeWidth={1.5} />
            Kirim untuk verifikasi AI
          </>
        )}
      </button>

      {isPending && (
        <p className="text-xs text-ink-muted">
          Mengunggah file ke server lalu mengirim ke AI untuk verifikasi. Proses
          ini dapat memakan waktu hingga 30 detik.
        </p>
      )}
    </form>
  )
}
