"use server"

import { requireBeneficiaryCommunity } from "@/src/lib/beneficiary/access"
import { getMilestoneProofUrl } from "@/src/lib/storage"
import { db } from "@/src/prisma/db"

export async function getMilestones(campaignId: string) {
  const { community } = await requireBeneficiaryCommunity()
  const id = Number(campaignId)
  if (!Number.isInteger(id) || id <= 0) return null
  const campaign = await db.orm.public.Campaign.first({ id })
  if (!campaign || campaign.communityId !== community.id) return null
  const milestones = await db.orm.public.Milestone.where({ campaignId: id }).all()
  const sortedMilestones = [...milestones].sort((a, b) => a.order - b.order)
  const milestonesWithFreshUrls = await Promise.all(
    sortedMilestones.map(async (milestone) => ({
      ...milestone,
      proofImageUrl: milestone.proofImageUrl
        ? await getMilestoneProofUrl(milestone.proofImageUrl).catch((error) => {
            console.error("Milestone proof URL refresh failed:", error)
            return null
          })
        : null,
    })),
  )
  return { campaign, milestones: milestonesWithFreshUrls }
}

export async function requestMilestoneDisbursement(milestoneId: string) {
  const { community } = await requireBeneficiaryCommunity()
  const id = Number(milestoneId)
  const milestone = Number.isInteger(id) ? await db.orm.public.Milestone.first({ id }) : null
  if (!milestone) return { success: false, message: "Milestone tidak ditemukan." }
  const campaign = await db.orm.public.Campaign.first({ id: milestone.campaignId })
  if (!campaign || campaign.communityId !== community.id) return { success: false, message: "Akses ditolak." }
  return {
    success: false,
    message: "Pengajuan pencairan diproses oleh admin setelah pemeriksaan bukti.",
  }
}
