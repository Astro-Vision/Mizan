import "server-only"
import { db } from "@/src/prisma/db"
import { campaignInputSchema, type CampaignInput } from "./validation"
import { canEditMilestones } from "../milestone-workflow"

export type CampaignTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

// Lock the parent before reading children so competing structure edits serialize.
export async function editableCampaign(tx: CampaignTransaction, id: number, communityId: number) {
  const campaign = await tx.orm.public.Campaign.where({ id, communityId }).update({ updatedAt: new Date().toISOString() })
  if (!campaign) throw new Error("Kampanye tidak ditemukan atau akses ditolak.")
  const milestones = await tx.orm.public.Milestone.where({ campaignId: id }).orderBy((m) => m.order.asc()).all()
  const payment = await tx.orm.public.CampaignPayment.where({ campaignId: id }).first()
  if (!canEditMilestones(campaign, milestones, Boolean(payment))) throw new Error("Struktur kampanye hanya dapat diedit saat draft/ditolak, tanpa aktivitas dana atau kontrak.")
  return { campaign, milestones }
}

export async function createCampaignWithMilestones(input: CampaignInput, community: { id: number; name: string }) {
  const data = campaignInputSchema.parse(input)
  return db.transaction(async (tx) => {
    const campaign = await tx.orm.public.Campaign.create({
      title: data.title, organizerName: community.name, communityId: community.id,
      category: data.category, source: "MANUAL", reviewStatus: "AI_DRAFT", status: "ACTIVE",
      recipientWallet: data.recipientWallet.toLowerCase(), targetAmountWei: data.targetAmountWei,
      raisedAmountWei: "0", donorCount: 0, currency: data.currency,
      aiDraft: { description: data.description, category: data.category, createdBy: "BENEFICIARY" },
      image: data.image || null, location: data.location || null,
      summary: data.description, daysLeft: data.daysLeft ?? 0,
    })
    for (const [index, milestone] of data.milestones.entries()) {
      await tx.orm.public.Milestone.create({ campaignId: campaign.id, order: index + 1, ...milestone, status: "PENDING" })
    }
    return campaign
  })
}
