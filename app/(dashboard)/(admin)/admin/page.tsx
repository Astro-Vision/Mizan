import type { Metadata } from "next"

import { StatCard } from "@/components/dashboard/stat-card"
import { ActivityRow } from "@/components/dashboard/activity-row"
import { CampaignRow } from "@/components/dashboard/campaign-row"
import {
  ADMIN_STATS,
  ADMIN_CAMPAIGNS,
  ADMIN_ACTIVITIES,
} from "@/lib/dashboard-data"
import { TESTNET_NOTICE } from "@/lib/site-data"

export const metadata: Metadata = {
  title: "Panel Admin",
}

/**
 * Halaman utama admin — ringkasan platform.
 *
 * Konvensi DESIGN.md:
 * §5  — Overline: mono, huruf besar, --brand-700. Judul: --text-h1.
 * §6  — Grid 12 kolom, gutter 24px. Jarak antar-section kelipatan 8.
 * §11 — Nada tenang, Bahasa Indonesia. Label testnet selalu terlihat.
 * §14 — Anti-slop: nol animasi, nol gradient, nol glassmorphism.
 */
export default function AdminPage() {
  return (
    <div className="mx-auto max-w-[1240px]">
      {/* Header */}
      <div className="mb-8">
        <p className="mz-overline">Panel Admin</p>
        <h1 className="mt-3 text-h1 text-ink">Ringkasan Platform</h1>
        <p className="mt-2 text-sm text-ink-muted">{TESTNET_NOTICE}</p>
      </div>

      {/* Stat cards — 4 kolom di desktop */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ADMIN_STATS.map((stat) => (
          <StatCard
            key={stat.label}
            stat={stat}
            isCurrency={stat.unit === "BNB" || stat.unit === "USDT"}
          />
        ))}
      </div>

      {/* Kampanye menunggu peninjauan */}
      <section className="mt-12">
        <h2 className="text-h3 text-ink">Kampanye</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Daftar kampanye beserta status peninjauan.
        </p>
        <div className="mt-6 rounded-2xl border border-line-soft bg-surface p-4 sm:p-6">
          {ADMIN_CAMPAIGNS.map((campaign) => (
            <CampaignRow key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </section>

      {/* Aktivitas terbaru */}
      <section className="mt-12">
        <h2 className="text-h3 text-ink">Aktivitas terbaru</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Transaksi dan kejadian terakhir di platform.
        </p>
        <div className="mt-6 rounded-2xl border border-line-soft bg-surface p-4 sm:p-6">
          {ADMIN_ACTIVITIES.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  )
}
