import { db } from "@/src/prisma/db"
import { summarizeConfirmedPayments } from "@/src/lib/payments/campaign-funding-summary"

export { summarizeConfirmedPayments } from "@/src/lib/payments/campaign-funding-summary"

/**
 * Recompute Campaign.raisedAmountWei + donorCount from CONFIRMED payments.
 * Call after every confirmed write so public cards, jelajahi, and benefactor stay aligned.
 */
export async function syncCampaignFunding(campaignId: number) {
  const payments = await db.orm.public.CampaignPayment.where({
    campaignId,
  }).all()
  const summary = summarizeConfirmedPayments(payments)

  await db.orm.public.Campaign.where({ id: campaignId }).update({
    raisedAmountWei: summary.raisedAmountWei,
    donorCount: summary.donorCount,
  })

  return summary.raisedAmountWei
}
