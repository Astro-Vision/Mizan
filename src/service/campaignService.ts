import { CreateDraftCampaignInput } from "../lib/type/campaignType"
import { db } from "../prisma/db"

export async function draftCampaignExistsByReference(
  aiReference: string
): Promise<boolean> {
  const existing = await db.orm.public.Campaign.where({ aiReference }).all()
  return existing.length > 0
}

export async function createDraftCampaign(input: CreateDraftCampaignInput) {
  return db.orm.public.Campaign.create({
    title: input.title,
    organizerName: input.organizerName,

    source: "AI_MOCK",
    aiDraft: input.aiDraftPayload,
    aiReference: input.aiReference,
    aiConfidence: input.aiConfidence,

    reviewStatus: "AI_DRAFT",

    targetAmountWei: input.targetAmountWei,
    raisedAmountWei: "0",
    currency: "BNB",

    category: input.category,
    recipientWallet: process.env.MIZAN_WALLET,
    summary: input.summary,
    location: input.location,
    daysLeft: input.days,
    image: input.image,
  })
}
