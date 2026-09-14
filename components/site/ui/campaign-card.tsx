import { BadgeCheck, Clock, MapPin } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  MILESTONE_TOTAL,
  formatAngka,
  milestoneSelesai,
  presentase,
  type Campaign,
} from "@/lib/site-data"

/**
 * Baris milestone: pengganti slot foto.
 *
 * Kartu donasi biasanya memakai foto penerima manfaat. Kami tidak memakainya
 * karena memajang foto orang sebagai "penerima" padahal bukan, itu menyesatkan.
 * Diganti data yang benar-benar ada: sudah sampai tahap berapa dananya.
 */

function MilestoneStrip({
  terkumpul,
  target,
}: {
  terkumpul: number
  target: number
}) {
  const selesai = milestoneSelesai(terkumpul, target)

  return (
    <div
      className="flex items-center gap-1.5"
      role="img"
      aria-label={`Pencairan tahap ${selesai} dari ${MILESTONE_TOTAL} sudah dilakukan`}
    >
      {Array.from({ length: MILESTONE_TOTAL }).map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={cn(
            "h-1.5 flex-1 rounded-full",
            i < selesai ? "bg-brand-700 dark:bg-brand-500" : "bg-brand-100 dark:bg-brand-950",
          )}
        />
      ))}
    </div>
  )
}

function Meta({ campaign }: { campaign: Campaign }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <span className="rounded-full bg-brand-50 px-2.5 py-1 text-label text-brand-700 dark:bg-brand-950 dark:text-brand-300">
        {campaign.kategori}
      </span>
      <span className="inline-flex items-center gap-1 mz-num text-xs text-ink-muted">
        <MapPin className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
        {campaign.lokasi}
      </span>
      <span className="ml-auto inline-flex items-center gap-1 mz-num text-xs text-ink-muted">
        <Clock className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
        sisa {campaign.sisaHari} hari
      </span>
    </div>
  )
}

function Progres({ campaign }: { campaign: Campaign }) {
  const pct = presentase(campaign.terkumpul, campaign.target)

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="mz-num text-lg font-semibold text-ink">
          {formatAngka(campaign.terkumpul)}
          <span className="text-sm font-normal text-ink-muted">
            {" "}
            {campaign.satuan}
          </span>
        </p>
        <p className="mz-num text-sm text-ink-muted">
          dari {formatAngka(campaign.target)} {campaign.satuan}
        </p>
      </div>

      <div
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-brand-100 dark:bg-brand-950"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Terkumpul ${pct} persen`}
      >
        <div
          className="h-full rounded-full bg-brand-700 dark:bg-brand-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-2 flex items-center justify-between gap-3 mz-num text-xs text-ink-muted">
        <span>{pct}% tercapai</span>
        <span>{campaign.donatur} donatur</span>
      </p>
    </div>
  )
}

function Penyelenggara({ campaign }: { campaign: Campaign }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
      <span className="font-medium text-ink-body">
        {campaign.penyelenggara}
      </span>
      {campaign.terverifikasi ? (
        <span className="inline-flex items-center gap-1 text-brand-700 dark:text-brand-300">
          <BadgeCheck
            className="size-3.5"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          Terverifikasi
        </span>
      ) : null}
    </p>
  )
}

export function CampaignCard({
  campaign,
  variant = "default",
}: {
  campaign: Campaign
  variant?: "default" | "featured"
}) {
  const featured = variant === "featured"

  return (
    <article
      className={cn(
        "mz-card flex flex-col gap-5 p-6 transition-colors duration-150 hover:border-brand-200 sm:p-7",
        featured && "lg:p-9",
      )}
    >
      <Meta campaign={campaign} />

      <div className={cn(featured && "lg:max-w-[42rem]")}>
        <h3
          className={cn(
            "text-balance text-ink",
            featured ? "text-h1" : "text-h3",
          )}
        >
          {campaign.judul}
        </h3>
        <div className="mt-3">
          <Penyelenggara campaign={campaign} />
        </div>
        <p
          className={cn(
            "mt-4 mz-prose text-ink-body",
            featured ? "text-body-lg" : "text-sm",
          )}
        >
          {campaign.ringkas}
        </p>
      </div>

      <div className={cn("mt-auto flex flex-col gap-5", featured && "lg:mt-2")}>
        <MilestoneStrip
          terkumpul={campaign.terkumpul}
          target={campaign.target}
        />
        <Progres campaign={campaign} />
      </div>
    </article>
  )
}
