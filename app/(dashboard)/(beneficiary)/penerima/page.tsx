import type { Metadata } from "next"
import { ArrowUpRight } from "lucide-react"

import { StatCard } from "@/components/dashboard/stat-card"
import { EXPLORER_URL } from "@/src/lib/dashboard-data"
import { formatWeiBnb, getLiveCampaignSnapshots } from "@/src/lib/dashboard-server"
import { TESTNET_NOTICE } from "@/src/lib/site-data"

export const metadata: Metadata = {
  title: "Dashboard Penerima",
}

export default async function PenerimaPage() {
  const campaigns = await getLiveCampaignSnapshots()
  const totalReceivedWei = campaigns
    .reduce((total, campaign) => total + BigInt(campaign.fundedAmountWei), BigInt(0))
    .toString()
  const paymentCount = campaigns.reduce((total, campaign) => total + campaign.paymentCount, 0)
  const stats = [
    { label: "Total dana diterima", value: formatWeiBnb(totalReceivedWei).replace(".", ","), unit: "BNB", icon: "ArrowDownLeft" },
    { label: "Kampanye aktif", value: String(campaigns.length), unit: "kampanye", icon: "Megaphone" },
    { label: "Kontribusi masuk", value: String(paymentCount), unit: "payment", icon: "Users" },
  ] as const

  return (
    <div className="mx-auto max-w-[1240px]">
      <div className="mb-8">
        <p className="mz-overline">Penerima Manfaat</p>
        <h1 className="mt-3 text-h1 text-ink">Ringkasan Dana</h1>
        <p className="mt-2 text-sm text-ink-muted">{TESTNET_NOTICE}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} isCurrency={stat.unit === "BNB"} />
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-h3 text-ink">Campaign dan transfer masuk</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Dana dihitung dari payment terkonfirmasi; mock tidak merepresentasikan dana blockchain nyata.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          {campaigns.length === 0 ? (
            <p className="rounded-2xl border border-line-soft bg-surface p-5 text-sm text-ink-muted">
              Belum ada campaign aktif dengan payment terkonfirmasi.
            </p>
          ) : campaigns.map((campaign) => (
            <div key={campaign.id} className="rounded-2xl border border-line-soft bg-surface p-5 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold leading-[1.3] text-ink">{campaign.judul}</p>
                  <p className="mt-1 text-xs text-ink-muted">{campaign.penyelenggara}</p>
                </div>
                <p className="font-mono text-sm tabular-nums text-ink">
                  {formatWeiBnb(campaign.fundedAmountWei).replace(".", ",")} BNB
                </p>
              </div>
              <p className="mt-4 text-xs text-ink-muted">
                Wallet penerima: <span className="font-mono text-ink">{campaign.recipientWallet ?? "Belum diatur"}</span>
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-line-soft pt-3">
                <span className="text-xs text-ink-muted">{campaign.paymentCount} payment terkonfirmasi</span>
                {campaign.latestTransactionHash ? (
                  <a
                    href={`${EXPLORER_URL}/tx/${campaign.latestTransactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs text-brand-700 dark:text-brand-300"
                  >
                    {campaign.latestTransactionHash.slice(0, 10)}…{campaign.latestTransactionHash.slice(-6)}
                    <ArrowUpRight className="size-3" strokeWidth={1.5} aria-hidden="true" />
                  </a>
                ) : (
                  <span className="text-xs text-ink-muted">Belum ada hash on-chain</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
