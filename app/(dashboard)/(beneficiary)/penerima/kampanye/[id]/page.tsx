import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, Pencil, ListChecks, ImageUp, Banknote, ArrowRight } from "lucide-react"
import { cn } from "@/src/lib/utils"

import { getBeneficiaryCampaignById } from "../actions"
import { CampaignDetailActions } from "./campaign-detail-actions"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const campaign = await getBeneficiaryCampaignById(id)
  return {
    title: campaign
      ? `${campaign.title} — Penerima Manfaat`
      : "Kampanye — Penerima Manfaat",
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  DRAFT: { bg: "bg-surface-sunken", text: "text-ink-muted", label: "Draft" },
  PENDING_REVIEW: {
    bg: "bg-accent-200 dark:bg-accent-200/20",
    text: "text-ink dark:text-accent-text",
    label: "Menunggu Review Admin",
  },
  AKTIF: {
    bg: "bg-brand-50 dark:bg-brand-950",
    text: "text-brand-700 dark:text-brand-300",
    label: "Aktif",
  },
  SELESAI: { bg: "bg-surface-sunken", text: "text-ink-muted", label: "Selesai" },
  DITUTUP: {
    bg: "bg-accent-200 dark:bg-accent-200/20",
    text: "text-ink dark:text-accent-text",
    label: "Ditutup",
  },
  DITOLAK: { bg: "bg-coral/10", text: "text-coral", label: "Ditolak" },
} as const

function formatWeiBnb(wei: string): string {
  const big = BigInt(wei || "0")
  const whole = big / BigInt("1000000000000000000")
  const frac = (big % BigInt("1000000000000000000"))
    .toString()
    .padStart(18, "0")
    .slice(0, 4)
    .replace(/0+$/, "")
  return frac ? `${whole}.${frac}` : whole.toString()
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-line-soft py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <dt className="shrink-0 text-sm text-ink-muted sm:w-48">{label}</dt>
      <dd className="text-sm text-ink sm:text-right">{value}</dd>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default async function KampanyeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const campaign = await getBeneficiaryCampaignById(id)
  if (!campaign) notFound()

  const statusCfg = STATUS_CONFIG[campaign.status] ?? STATUS_CONFIG.DRAFT
  const raisedBnb = formatWeiBnb(campaign.raisedAmountWei)
  const targetBnb = formatWeiBnb(campaign.targetAmountWei)
  const isDraft = campaign.reviewStatus === "AI_DRAFT"
  const isRejected = campaign.reviewStatus === "REJECTED"
  const canEdit = isDraft || isRejected

  const createdDate = new Date(campaign.createdAt).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
  const updatedDate = new Date(campaign.updatedAt).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="mx-auto max-w-[840px]">
      {/* Breadcrumb */}
      <Link
        href="/penerima/kampanye"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ChevronLeft className="size-4" strokeWidth={1.5} aria-hidden="true" />
        Kampanye Saya
      </Link>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="mz-overline">Penerima Manfaat</p>
          <h1 className="mt-3 text-h1 text-ink">{campaign.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex h-7 items-center rounded-full px-3 text-[0.75rem] font-semibold tracking-[0.02em] uppercase",
                statusCfg.bg,
                statusCfg.text,
              )}
            >
              {statusCfg.label}
            </span>
            <span className="inline-flex h-7 items-center rounded-full bg-surface-sunken px-3 text-xs text-ink-muted">
              {campaign.category}
            </span>
          </div>
        </div>

        {/* Primary actions */}
        <div className="flex shrink-0 flex-wrap gap-2">
          {canEdit && (
            <Link
              href={`/penerima/kampanye/${id}/edit`}
              className="inline-flex h-10 items-center gap-2 rounded-[6px] border border-line-ui px-4 text-sm font-medium text-ink transition-colors hover:bg-surface-sunken"
            >
              <Pencil className="size-4" strokeWidth={1.5} aria-hidden="true" />
              Edit
            </Link>
          )}
          {/* Delete + submit-for-review use client component with confirmation dialogs */}
          <CampaignDetailActions campaignId={id} status={campaign.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left / main */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          {campaign.description ? (
            <section className="rounded-2xl border border-line-soft bg-surface p-6">
              <h2 className="mb-3 text-sm font-semibold text-ink">Deskripsi Kampanye</h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-muted">
                {campaign.description}
              </p>
            </section>
          ) : null}

          {/* Progress */}
          <section className="rounded-2xl border border-line-soft bg-surface p-6">
            <h2 className="mb-4 text-sm font-semibold text-ink">Progress Dana</h2>
            <div className="mb-2 flex items-end justify-between">
              <span className="font-mono text-2xl font-semibold tabular-nums text-ink">
                {raisedBnb}
                <span className="ml-1 text-sm font-normal text-ink-muted">{campaign.currency}</span>
              </span>
              <span className="text-sm text-ink-muted">
                dari {targetBnb} {campaign.currency}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-brand-100 dark:bg-brand-900">
              <div
                className="h-full rounded-full bg-brand-700 transition-[width] duration-300"
                style={{ width: `${campaign.progressPct}%` }}
              />
            </div>
            <p className="mt-2 text-right font-mono text-xs tabular-nums text-ink-muted">
              {campaign.progressPct}%
            </p>

            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-line-soft pt-4">
              <div>
                <p className="text-xs text-ink-muted">Jumlah donor</p>
                <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-ink">
                  {campaign.donorCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-ink-muted">Milestone berikutnya</p>
                <p className="mt-1 text-sm text-ink">{campaign.nextMilestone ?? "—"}</p>
              </div>
            </div>
          </section>

          {/* Milestone & bukti — coming soon stubs */}
          <section className="rounded-2xl border border-line-soft bg-surface p-6">
            <h2 className="mb-4 text-sm font-semibold text-ink">Milestone &amp; Bukti</h2>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                disabled
                className="flex items-center justify-between rounded-[6px] border border-line-soft px-4 py-3 text-sm text-ink-muted opacity-60 cursor-not-allowed"
              >
                <span className="flex items-center gap-2">
                  <ListChecks className="size-4" strokeWidth={1.5} aria-hidden="true" />
                  Kelola Milestone
                </span>
                <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
              </button>
              <button
                type="button"
                disabled
                className="flex items-center justify-between rounded-[6px] border border-line-soft px-4 py-3 text-sm text-ink-muted opacity-60 cursor-not-allowed"
              >
                <span className="flex items-center gap-2">
                  <ImageUp className="size-4" strokeWidth={1.5} aria-hidden="true" />
                  Upload Bukti Penyaluran
                </span>
                <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
              </button>
              <button
                type="button"
                disabled
                className="flex items-center justify-between rounded-[6px] border border-line-soft px-4 py-3 text-sm text-ink-muted opacity-60 cursor-not-allowed"
              >
                <span className="flex items-center gap-2">
                  <Banknote className="size-4" strokeWidth={1.5} aria-hidden="true" />
                  Ajukan Pencairan Dana
                </span>
                <ArrowRight className="size-4" strokeWidth={1.5} aria-hidden="true" />
              </button>
              <p className="mt-1 text-xs text-ink-muted">
                Fitur ini tersedia setelah kampanye aktif dan admin menyetujui milestone.
              </p>
            </div>
          </section>
        </div>

        {/* Right / meta */}
        <aside className="space-y-6">
          <section className="rounded-2xl border border-line-soft bg-surface p-6">
            <h2 className="mb-2 text-sm font-semibold text-ink">Detail Kampanye</h2>
            <dl>
              <InfoRow label="Penyelenggara" value={campaign.organizerName} />
              <InfoRow label="Kategori" value={campaign.category} />
              <InfoRow label="Status" value={statusCfg.label} />
              <InfoRow
                label="Wallet penerima"
                value={
                  campaign.recipientWallet ? (
                    <span className="break-all font-mono text-xs">
                      {campaign.recipientWallet}
                    </span>
                  ) : (
                    <span className="text-ink-muted">Belum diatur</span>
                  )
                }
              />
              <InfoRow label="Dibuat" value={createdDate} />
              <InfoRow label="Diperbarui" value={updatedDate} />
            </dl>
          </section>
        </aside>
      </div>
    </div>
  )
}
