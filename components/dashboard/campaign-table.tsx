"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/src/lib/utils"
import { Pencil, Trash2, Loader2 } from "lucide-react"

import type { CampaignReview } from "@/src/lib/dashboard-data"
import { formatAngka } from "@/src/lib/site-data"
import { deleteCampaign } from "@/app/(dashboard)/(admin)/admin/kampanye/actions"

type CampaignTableProps = {
  campaigns: CampaignReview[]
}

const STATUS_STYLES: Record<
  CampaignReview["status"],
  { bg: string; text: string; label: string }
> = {
  menunggu: {
    bg: "bg-accent-200 dark:bg-accent-200/20",
    text: "text-ink dark:text-accent-text",
    label: "Menunggu",
  },
  aktif: {
    bg: "bg-brand-50 dark:bg-brand-950",
    text: "text-brand-700 dark:text-brand-300",
    label: "Aktif",
  },
  selesai: {
    bg: "bg-surface-sunken dark:bg-surface-sunken",
    text: "text-ink-muted",
    label: "Selesai",
  },
}

/**
 * Tabel kampanye dengan kolom aksi (Edit / Hapus).
 */
export function CampaignTable({ campaigns }: CampaignTableProps) {
  if (campaigns.length === 0) {
    return (
      <div className="rounded-2xl border border-line-soft bg-surface px-6 py-12 text-center">
        <p className="text-sm text-ink-muted">Belum ada kampanye.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-line-soft bg-surface">
      {/* Header tabel — hanya tampil di desktop */}
      <div className="hidden border-b border-line-soft px-6 py-3 sm:flex">
        <span className="min-w-0 flex-1 text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
          Kampanye
        </span>
        <span className="w-32 text-right text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
          Progress
        </span>
        <span className="w-36 text-right text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
          Target
        </span>
        <span className="w-24 text-center text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
          Status
        </span>
        <span className="w-24 text-center text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
          Aksi
        </span>
      </div>

      {/* Baris kampanye */}
      {campaigns.map((campaign) => (
        <CampaignTableRow key={campaign.id} campaign={campaign} />
      ))}
    </div>
  )
}

// ── Baris per kampanye ──────────────────────────────────────────────────────

function CampaignTableRow({ campaign }: { campaign: CampaignReview }) {
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  const pct =
    campaign.target > 0
      ? Math.min(100, Math.round((campaign.terkumpul / campaign.target) * 100))
      : 0
  const style = STATUS_STYLES[campaign.status]

  async function handleDelete() {
    setDeleting(true)
    await deleteCampaign(campaign.id)
    // revalidatePath di server action akan menyegarkan halaman
  }

  return (
    <div className="flex flex-col gap-3 border-b border-line-soft px-6 py-4 last:border-b-0 sm:flex-row sm:items-center sm:gap-4">
      {/* Info kampanye */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold leading-[1.3] text-ink">
          {campaign.judul}
        </p>
        <p className="mt-1 text-xs text-ink-muted">{campaign.penyelenggara}</p>
      </div>

      {/* Progress bar */}
      <div className="flex w-full items-center gap-3 sm:w-32">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-900">
          <div
            className="h-full rounded-full bg-brand-700 transition-[width] duration-150"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="shrink-0 font-mono text-xs tabular-nums text-ink-muted">
          {pct}%
        </span>
      </div>

      {/* Nominal */}
      <p className="shrink-0 text-right font-mono text-sm tabular-nums text-ink sm:w-36">
        {formatAngka(campaign.terkumpul)}
        <span className="text-ink-muted">
          {" "}
          / {formatAngka(campaign.target)}
        </span>
        <span className="ml-1 text-xs text-ink-muted">{campaign.satuan}</span>
      </p>

      {/* Badge status */}
      <div className="sm:w-24 sm:text-center">
        <span
          className={cn(
            "inline-flex h-7 items-center rounded-full px-3 text-[0.8125rem] font-semibold uppercase leading-[1.4] tracking-[0.02em]",
            style.bg,
            style.text,
          )}
        >
          {style.label}
        </span>
      </div>

      {/* Tombol aksi */}
      <div className="flex items-center gap-1 sm:w-24 sm:justify-center">
        {confirmDelete ? (
          <>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex h-8 items-center gap-1 rounded-[6px] bg-brand-500 px-3 text-xs font-medium text-white transition-colors duration-150 hover:bg-brand-600 disabled:opacity-50"
            >
              {deleting ? (
                <Loader2
                  className="size-3.5 animate-spin"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              ) : null}
              Ya
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="inline-flex h-8 items-center rounded-[6px] px-3 text-xs font-medium text-ink-muted transition-colors duration-150 hover:bg-surface-sunken hover:text-ink"
            >
              Batal
            </button>
          </>
        ) : (
          <>
            <Link
              href={`/admin/kampanye/${campaign.id}/edit`}
              className="flex size-8 items-center justify-center rounded-[6px] text-ink-muted transition-colors duration-150 hover:bg-surface-sunken hover:text-ink"
              aria-label={`Edit kampanye ${campaign.judul}`}
            >
              <Pencil className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex size-8 items-center justify-center rounded-[6px] text-ink-muted transition-colors duration-150 hover:bg-brand-50 hover:text-brand-500 dark:hover:bg-brand-950"
              aria-label={`Hapus kampanye ${campaign.judul}`}
            >
              <Trash2 className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
