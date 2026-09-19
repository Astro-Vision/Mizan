import type { Metadata } from "next"

import { StatCard } from "@/components/dashboard/stat-card"
import {
  BENEFICIARY_STATS,
  BENEFICIARY_PENYALURAN,
  EXPLORER_URL,
} from "@/src/lib/dashboard-data"
import { TESTNET_NOTICE } from "@/src/lib/site-data"
import { ArrowUpRight, ShieldCheck, Clock, Circle } from "lucide-react"

export const metadata: Metadata = {
  title: "Dashboard Penerima",
}

const MILESTONE_STATUS = {
  terverifikasi: {
    icon: ShieldCheck,
    text: "text-brand-700 dark:text-brand-300",
    bg: "bg-brand-50 dark:bg-brand-950",
    label: "Terverifikasi",
  },
  menunggu: {
    icon: Clock,
    text: "text-ink dark:text-accent-text",
    bg: "bg-accent-200 dark:bg-accent-200/20",
    label: "Menunggu",
  },
  belum: {
    icon: Circle,
    text: "text-ink-muted",
    bg: "bg-surface-sunken",
    label: "Belum dicairkan",
  },
} as const

// Halaman utama penerima manfaat — ringkasan penyaluran.
export default function PenerimaPage() {
  return (
    <div className="mx-auto max-w-[1240px]">
      {/* Header */}
      <div className="mb-8">
        <p className="mz-overline">Penerima Manfaat</p>
        <h1 className="mt-3 text-h1 text-ink">Ringkasan Penyaluran</h1>
        <p className="mt-2 text-sm text-ink-muted">{TESTNET_NOTICE}</p>
      </div>

      {/* Stat cards — 3 kolom */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BENEFICIARY_STATS.map((stat) => (
          <StatCard
            key={stat.label}
            stat={stat}
            isCurrency={stat.unit === "BNB" || stat.unit === "USDT"}
          />
        ))}
      </div>

      {/* Daftar penyaluran */}
      <section className="mt-12">
        <h2 className="text-h3 text-ink">Penyaluran kampanye</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Detail penyaluran dana per kampanye beserta status milestone.
        </p>

        <div className="mt-6 flex flex-col gap-6">
          {BENEFICIARY_PENYALURAN.map((penyaluran) => (
            <div
              key={penyaluran.id}
              className="rounded-2xl border border-line-soft bg-surface p-5 sm:p-6"
            >
              {/* Header kampanye */}
              <p className="text-sm font-semibold leading-[1.3] text-ink">
                {penyaluran.kampanye}
              </p>
              <p className="mt-1 text-xs text-ink-muted">
                {penyaluran.penyelenggara}
              </p>
              <p className="mt-2 font-mono text-sm tabular-nums text-ink">
                Total diterima: {penyaluran.totalDiterima}{" "}
                <span className="text-xs text-ink-muted">
                  {penyaluran.satuan}
                </span>
              </p>

              {/* Progress milestone visual */}
              <div className="mt-5 flex items-center gap-1">
                {penyaluran.milestones.map((ms, i) => (
                  <div
                    key={ms.tahap}
                    className={`h-2 flex-1 rounded-full ${ms.status === "terverifikasi"
                      ? "bg-brand-700"
                      : ms.status === "menunggu"
                        ? "bg-accent-500"
                        : "bg-brand-100 dark:bg-brand-900"
                      }`}
                  />
                ))}
              </div>

              {/* Daftar milestone */}
              <div className="mt-4 flex flex-col gap-3">
                {penyaluran.milestones.map((ms) => {
                  const style = MILESTONE_STATUS[ms.status]
                  const StatusIcon = style.icon

                  return (
                    <div
                      key={ms.tahap}
                      className="flex flex-col gap-2 border-b border-line-soft pb-3 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4"
                    >
                      {/* Tahap */}
                      <span className="shrink-0 font-mono text-xs tabular-nums text-ink-muted">
                        Tahap {ms.tahap}/{ms.totalTahap}
                      </span>

                      {/* Badge status */}
                      <span
                        className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-[0.8125rem] font-semibold leading-[1.4] tracking-[0.02em] ${style.bg} ${style.text}`}
                      >
                        <StatusIcon
                          className="size-3.5"
                          strokeWidth={1.5}
                          aria-hidden="true"
                        />
                        {style.label}
                      </span>

                      {/* Nominal */}
                      <span className="font-mono text-sm tabular-nums text-ink sm:ml-auto">
                        {ms.nominal}{" "}
                        <span className="text-xs text-ink-muted">
                          {ms.satuan}
                        </span>
                      </span>

                      {/* Hash + tanggal */}
                      {ms.hash ? (
                        <div className="flex items-center gap-2">
                          <a
                            href={`${EXPLORER_URL}/tx/${ms.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-xs text-brand-700 transition-colors duration-150 hover:text-brand-600 dark:text-brand-300 dark:hover:text-brand-200"
                          >
                            {ms.hashShort}
                            <ArrowUpRight
                              className="size-3"
                              strokeWidth={1.5}
                              aria-hidden="true"
                            />
                          </a>
                          {ms.tanggal ? (
                            <span className="text-xs text-ink-muted">
                              {ms.tanggal}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
