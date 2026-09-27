"use client"

import { useState } from "react"
import { Check, ExternalLink, Loader2, X } from "lucide-react"
import { cn } from "@/src/lib/utils"
import { useLanguage } from "@/components/site/language-provider"
import type { AdminDisbursementItem } from "@/app/(dashboard)/(admin)/admin/penyaluran/actions"
import {
  approveMilestoneDisbursement,
  markMilestoneDisbursed,
  rejectMilestoneProof,
} from "@/app/(dashboard)/(admin)/admin/penyaluran/actions"

const statusConfig = {
  PENDING: ["Belum ada bukti", "bg-surface-sunken text-ink-muted"],
  PROOF_SUBMITTED: ["Perlu diperiksa", "bg-accent-200/20 text-ink"],
  AI_VERIFIED: ["AI terverifikasi", "bg-brand-50 text-brand-700"],
  REJECTED: ["Ditolak", "bg-coral/10 text-coral"],
  DISBURSEMENT_REQUESTED: ["Siap dicairkan", "bg-accent-200/20 text-ink"],
  DISBURSED: ["Sudah disalurkan", "bg-brand-50 text-brand-700"],
} as const

export function AdminDisbursementTable({ items }: { items: AdminDisbursementItem[] }) {
  const { t } = useLanguage()
  if (items.length === 0) {
    return <div className="rounded-2xl border border-line-soft bg-surface px-6 py-12 text-center text-sm text-ink-muted">{t("Belum ada milestone.")}</div>
  }
  return <div className="space-y-4">{items.map((item) => <AdminDisbursementCard key={item.id} item={item} />)}</div>
}

function AdminDisbursementCard({ item }: { item: AdminDisbursementItem }) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [txHash, setTxHash] = useState(item.disbursementTxHash ?? "")
  const [showTxInput, setShowTxInput] = useState(false)
  const { t } = useLanguage()
  const [label, tone] = statusConfig[item.status]

  async function run(action: () => Promise<{ success: boolean; message: string }>) {
    setBusy(true)
    setMessage(null)
    try {
      const result = await action()
      setMessage(result.message)
      if (result.success) window.location.reload()
    } catch {
      setMessage("Terjadi kesalahan saat memproses milestone.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <article className="rounded-2xl border border-line-soft bg-surface p-5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-ink-muted">#{item.campaignId} · Tahap {item.milestoneOrder}</span>
            <span className={cn("inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold", tone)}>{t(label)}</span>
          </div>
          <h2 className="mt-2 text-lg font-semibold text-ink">{item.campaignTitle}</h2>
          <p className="mt-1 text-sm text-ink-muted">{item.organizerName} · {item.description}</p>
          <p className="mt-3 font-mono text-sm font-semibold text-ink">{formatWei(item.amountWei)} {item.currency}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {item.proofUrl ? <a href={item.proofUrl} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-line-ui px-3 text-sm text-ink hover:bg-surface-sunken"><ExternalLink className="size-4" />{t("Lihat bukti")}</a> : null}
          {item.status === "PROOF_SUBMITTED" || item.status === "AI_VERIFIED" ? <><button type="button" disabled={busy} onClick={() => void run(() => approveMilestoneDisbursement(item.id))} className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-brand-700 px-3 text-sm font-medium text-white disabled:opacity-50"><Check className="size-4" />{t("Setujui")}</button><button type="button" disabled={busy} onClick={() => void run(() => rejectMilestoneProof(item.id))} className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-coral/40 px-3 text-sm font-medium text-coral disabled:opacity-50"><X className="size-4" />{t("Tolak")}</button></> : null}
          {item.status === "DISBURSEMENT_REQUESTED" && !showTxInput ? <button type="button" disabled={busy} onClick={() => setShowTxInput(true)} className="inline-flex h-10 items-center gap-2 rounded-[10px] bg-brand-700 px-3 text-sm font-medium text-white disabled:opacity-50">{t("Tandai disalurkan")}</button> : null}
        </div>
      </div>
      <div className="mt-5 grid gap-4 border-t border-line-soft pt-4 lg:grid-cols-2">
        <div><p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">{t("Catatan penggunaan dana")}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">{item.proofNote || t("Belum ada catatan.")}</p></div>
        <div><p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">{t("Output verifikasi Langflow")}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink">{item.aiVerificationNote || t("Belum ada output AI.")}</p>{item.aiConfidence != null ? <p className="mt-2 text-xs text-ink-muted">Confidence: {Math.round(item.aiConfidence * 100)}%</p> : null}</div>
      </div>
      {showTxInput ? <div className="mt-4 flex flex-col gap-2 rounded-xl bg-surface-sunken p-4 sm:flex-row"><input value={txHash} onChange={(event) => setTxHash(event.target.value)} placeholder="Transaction hash (opsional)" className="h-10 min-w-0 flex-1 rounded-[6px] border border-line-ui bg-surface px-3 font-mono text-xs" /><button type="button" disabled={busy} onClick={() => void run(() => markMilestoneDisbursed(item.id, txHash))} className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-brand-700 px-4 text-sm font-medium text-white disabled:opacity-50">{busy ? <Loader2 className="size-4 animate-spin" /> : null}{t("Konfirmasi")}</button></div> : null}
      {message ? <p className="mt-3 text-sm text-ink-muted" role="status">{message}</p> : null}
    </article>
  )
}

function formatWei(value: string) {
  const big = BigInt(value || "0")
  const whole = big / BigInt("1000000000000000000")
  const fraction = (big % BigInt("1000000000000000000")).toString().padStart(18, "0").slice(0, 4).replace(/0+$/, "")
  return `${whole}${fraction ? `.${fraction}` : ""}`
}
