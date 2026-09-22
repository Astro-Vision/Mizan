import { notFound } from "next/navigation"

import { SiteFooter } from "@/components/site/layout/site-footer"
import { SiteHeader } from "@/components/site/layout/site-header"
import { CampaignDetail } from "@/components/site/sections/campaign-detail"
import { getCampaignById } from "@/src/lib/site-data"

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const campaign = getCampaignById(id)

  if (!campaign) notFound()

  return (
    <>
      <SiteHeader />
      <CampaignDetail campaign={campaign} />
      <SiteFooter />
    </>
  )
}
