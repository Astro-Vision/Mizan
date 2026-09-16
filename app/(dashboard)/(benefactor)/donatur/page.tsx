import type { Metadata } from "next"

import { StatCard } from "@/components/dashboard/stat-card"
import { ActivityRow } from "@/components/dashboard/activity-row"
import {
  BENEFACTOR_STATS,
  BENEFACTOR_CAMPAIGNS,
  BENEFACTOR_ACTIVITIES,
  EXPLORER_URL,
} from "@/lib/dashboard-data"
import { formatAngka } from "@/lib/site-data"
import { TESTNET_NOTICE } from "@/lib/site-data"

export const metadata: Metadata = {
  title: "Dashboard Donatur",
}

// Halaman utama donatur — ringkasan donasi pribadi.

export default function DonaturPage() {
  return (
    <div className="mx-auto max-w-[1240px]">
      {/* Header */}
      <div className="mb-8">
        <p className="mz-overline">Donatur</p>
        <h1 className="mt-3 text-h1 text-ink">Ringkasan Donasi</h1>
        <p className="mt-2 text-sm text-ink-muted">{TESTNET_NOTICE}</p>
      </div>

      {/* Stat cards — 3 kolom */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BENEFACTOR_STATS.map((stat) => (
          <StatCard
            key={stat.label}
            stat={stat}
            isCurrency={stat.unit === "BNB" || stat.unit === "USDT"}
          />
        ))}
      </div>

      {/* Kampanye yang didukung */}
      <section className="mt-12">
        <h2 className="text-h3 text-ink">Kampanye yang kamu dukung</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Daftar kampanye yang pernah kamu donasi beserta progresnya.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {BENEFACTOR_CAMPAIGNS.map((campaign) => {
            const pct = Math.min(
              100,
              Math.round((campaign.terkumpul / campaign.target) * 100),
            )

            return (
              <div
                key={campaign.id}
                className="rounded-2xl border border-line-soft bg-surface p-5"
              >
                {/* Judul + penyelenggara */}
                <p className="text-sm font-semibold leading-[1.3] text-ink">
                  {campaign.judul}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {campaign.penyelenggara}
                </p>

                {/* Progress */}
                <div className="mt-4 flex items-center gap-3">
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

                {/* Angka */}
                <div className="mt-3 flex items-baseline justify-between">
                  <p className="font-mono text-sm tabular-nums text-ink">
                    {formatAngka(campaign.terkumpul)}
                    <span className="text-ink-muted">
                      {" "}
                      / {formatAngka(campaign.target)}
                    </span>
                    <span className="ml-1 text-xs text-ink-muted">
                      {campaign.satuan}
                    </span>
                  </p>
                </div>

                {/* Kontribusi */}
                <div className="mt-4 flex items-center justify-between border-t border-line-soft pt-3">
                  <span className="text-xs text-ink-muted">
                    Kontribusi kamu
                  </span>
                  <span className="font-mono text-sm tabular-nums text-ink">
                    {campaign.kontribusi}{" "}
                    <span className="text-xs text-ink-muted">
                      {campaign.satuan}
                    </span>
                  </span>
                </div>
                <p className="mt-1 text-right text-xs text-ink-muted">
                  {campaign.tanggalDonasi}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Riwayat transaksi */}
      <section className="mt-12">
        <h2 className="text-h3 text-ink">Riwayat transaksi</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Transaksi terakhir dari dompet kamu.
        </p>
        <div className="mt-6 rounded-2xl border border-line-soft bg-surface p-4 sm:p-6">
          {BENEFACTOR_ACTIVITIES.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  )
}
