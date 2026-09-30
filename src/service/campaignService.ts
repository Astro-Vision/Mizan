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
    organizerName: "Admin Mizan",

    source: "AI_MOCK",
    communityId: null,
    aiDraft: input.aiDraftPayload,
    aiReference: input.aiReference,
    aiConfidence: input.aiConfidence,

    reviewStatus: "AI_DRAFT",

    targetAmountWei: input.targetAmountWei,
    raisedAmountWei: "0",
    currency: "BNB",

    category: input.category,
  })
}
