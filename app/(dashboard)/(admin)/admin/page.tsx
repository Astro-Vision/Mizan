import type { Metadata } from "next"

import { StatCard } from "@/components/dashboard/stat-card"
import { ActivityRow } from "@/components/dashboard/activity-row"
import { CampaignRow } from "@/components/dashboard/campaign-row"
import {
  ADMIN_STATS,
  ADMIN_ACTIVITIES,
} from "@/src/lib/dashboard-data"
import { getCampaigns } from "./kampanye/actions"
import { TESTNET_NOTICE } from "@/src/lib/site-data"

export const metadata: Metadata = {
  title: "Panel Admin",
}

export default async function AdminPage() {
  const campaigns = await getCampaigns()
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
          {campaigns.map((campaign) => (
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
