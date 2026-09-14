import { ArrowRight } from "lucide-react"

import { CampaignCard } from "@/components/site/ui/campaign-card"
import { SectionHead } from "@/components/site/ui/section-head"
import { CAMPAIGNS, FEATURED } from "@/lib/site-data"

/**
 * Kampanye unggulan. Hierarki dibuat lewat ukuran — satu besar, tiga kecil —
 * bukan lewat urutan. Semua kartu sama besar berarti mata tidak tahu harus
 * melihat ke mana. Lihat DESIGN.md §2 butir 8.
 */

export function Campaigns() {
  return (
    <section id="kampanye" className="mz-section bg-surface-sunken">
      <div className="mz-container">
        <SectionHead
          overline="Kampanye"
          title="Yang sedang berjalan"
          desc="Setiap kampanye mencairkan dana bertahap. Sisa dana yang tidak tersalur dikembalikan ke donatur, bukan disimpan."
          align="between"
          action={
            <a
              href="#kampanye"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-700 transition-colors duration-150 hover:text-brand-600 dark:text-brand-300"
            >
              Lihat semua kampanye
              <ArrowRight
                className="size-4"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </a>
          }
        />

        <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="lg:col-span-3">
            <CampaignCard campaign={FEATURED} variant="featured" />
          </div>
          {CAMPAIGNS.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      </div>
    </section>
  )
}
