import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { createBeneficiaryCampaign } from "../actions"
import { BeneficiaryCampaignCreateForm } from "@/components/dashboard/beneficiary-campaign-create-form"
import { requireBeneficiaryCommunity } from "@/src/lib/beneficiary/access"

export const metadata: Metadata = {
  title: "Buat Kampanye — Penerima Manfaat",
}

export default async function BuatKampanyePage() {
  const { community } = await requireBeneficiaryCommunity()
  return (
    <div className="mx-auto max-w-[720px]">
      {/* Breadcrumb */}
      <Link
        href="/beneficiary/campaigns"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ChevronLeft className="size-4" strokeWidth={1.5} aria-hidden="true" />
        Kampanye Saya
      </Link>

      {/* Header */}
      <div className="mb-8">
        <p className="mz-overline">Penerima Manfaat</p>
        <h1 className="mt-3 text-h1 text-ink">Buat Kampanye Baru</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Kampanye akan diajukan untuk ditinjau Admin sebelum tampil ke publik.
        </p>
      </div>

      {/* Form */}
      <div>
        <BeneficiaryCampaignCreateForm
          action={createBeneficiaryCampaign}
          organizerName={community.name}
        />
      </div>
    </div>
  )
}
