"use server"

import { revalidatePath } from "next/cache"
import { getMilestoneProofUrl } from "@/src/lib/storage"
import { requireAdminSession } from "@/src/lib/beneficiary/access"
import { db } from "@/src/prisma/db"
import {
  canApplyMilestoneAdminAction,
  milestoneAdminActionMessage,
  type MilestoneAdminAction,
  type MilestoneStatus,
} from "@/src/lib/milestone-workflow"

export type AdminDisbursementItem = {
  id: string
  campaignId: string
  campaignTitle: string
  organizerName: string
  milestoneOrder: number
  description: string
  amountWei: string
  currency: string
  status: MilestoneStatus
  proofUrl: string | null
  proofNote: string | null
  aiVerificationNote: string | null
  aiConfidence: number | null
  disbursementRequestedAt: string | null
  disbursementTxHash: string | null
}

export async function getAdminDisbursements(): Promise<AdminDisbursementItem[]> {
  await requireAdminSession()
  const milestones = await db.orm.public.Milestone.orderBy((row) => row.updatedAt.desc()).all()

  return Promise.all(milestones.map(async (milestone) => {
    const campaign = await db.orm.public.Campaign.first({ id: milestone.campaignId })
    const proofUrl = milestone.proofImageUrl
      ? await getMilestoneProofUrl(milestone.proofImageUrl).catch((error) => {
          console.error("Admin proof URL refresh failed:", error)
          return null
        })
      : null

    return {
      id: String(milestone.id),
      campaignId: String(milestone.campaignId),
      campaignTitle: campaign?.title ?? "Kampanye tidak ditemukan",
      organizerName: campaign?.organizerName ?? "—",
      milestoneOrder: milestone.order,
      description: milestone.description,
      amountWei: milestone.amountWei,
      currency: campaign?.currency ?? "BNB",
      status: milestone.status as MilestoneStatus,
      proofUrl,
      proofNote: milestone.proofNote,
      aiVerificationNote: milestone.aiVerificationNote,
      aiConfidence: milestone.aiConfidence,
      disbursementRequestedAt: milestone.disbursementRequestedAt,
      disbursementTxHash: milestone.disbursementTxHash,
    }
  }))
}

async function getAdminMilestone(id: string) {
  await requireAdminSession()
  const milestoneId = Number(id)
  if (!Number.isInteger(milestoneId) || milestoneId <= 0) return null
  const milestone = await db.orm.public.Milestone.first({ id: milestoneId })
  if (!milestone) return null
  const campaign = await db.orm.public.Campaign.first({ id: milestone.campaignId })
  return { milestone, campaign }
}

async function applyAdminAction(
  id: string,
  action: MilestoneAdminAction,
  txHash?: string,
) {
  const result = await getAdminMilestone(id)
  if (!result) return { success: false, message: "Milestone tidak ditemukan." }

  const status = result.milestone.status as MilestoneStatus
  if (!canApplyMilestoneAdminAction(status, action)) {
    return { success: false, message: `Aksi tidak tersedia untuk status ${status}.` }
  }

  if (action === "APPROVE") {
    await db.orm.public.Milestone.where((row) => row.id.eq(result.milestone.id)).update({
      status: "DISBURSEMENT_REQUESTED",
      disbursementRequestedAt: new Date().toISOString(),
    })
  } else if (action === "REJECT") {
    await db.orm.public.Milestone.where((row) => row.id.eq(result.milestone.id)).update({
      status: "REJECTED",
    })
  } else {
    await db.orm.public.Milestone.where((row) => row.id.eq(result.milestone.id)).update({
      status: "DISBURSED",
      disbursementTxHash: txHash?.trim() || null,
    })
  }

  revalidatePath("/admin/penyaluran")
  if (result.campaign) {
    revalidatePath(`/beneficiary/campaigns/${result.campaign.id}/milestones`)
    revalidatePath(`/beneficiary/campaigns/${result.campaign.id}/disbursement`)
  }
  return { success: true, message: milestoneAdminActionMessage(action) }
}

export async function approveMilestoneDisbursement(id: string) {
  return applyAdminAction(id, "APPROVE")
}

export async function rejectMilestoneProof(id: string) {
  return applyAdminAction(id, "REJECT")
}

export async function markMilestoneDisbursed(id: string, txHash?: string) {
  return applyAdminAction(id, "DISBURSE", txHash)
}
