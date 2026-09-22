import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { BeneficiaryCampaignForm } from "@/components/dashboard/beneficiary-campaign-form"
import { createBeneficiaryCampaign } from "../actions"

export const metadata: Metadata = {
  title: "Buat Kampanye — Penerima Manfaat",
}

export default function BuatKampanyePage() {
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
          Kampanye disimpan sebagai Draft dan harus diajukan untuk ditinjau admin sebelum aktif.
        </p>
      </div>

      {/* Form */}
      <div className="rounded-2xl border border-line-soft bg-surface p-6 sm:p-8">
        <BeneficiaryCampaignForm
          action={createBeneficiaryCampaign}
          submitLabel="Buat Kampanye"
        />
      </div>
    </div>
  )
}
