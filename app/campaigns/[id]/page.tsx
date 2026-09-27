import { notFound } from "next/navigation"

import { SiteFooter } from "@/components/site/layout/site-footer"
import { SiteHeader } from "@/components/site/layout/site-header"
import { CampaignDetail } from "@/components/site/sections/campaign-detail"
import { getPublicCampaignById } from "@/src/lib/campaigns-server"

// Detail always reflects the latest campaign row.
export const dynamic = "force-dynamic"

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const campaign = await getPublicCampaignById(id)

  if (!campaign) notFound()

  return (
    <>
      <SiteHeader />
      <CampaignDetail campaign={campaign} />
      <SiteFooter />
    </>
  )
}
