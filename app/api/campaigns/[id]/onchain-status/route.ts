import {
  getCampaignState,
  getConfiguredVaultAddress,
} from "@/src/lib/chain/vault"
import { db } from "@/src/prisma/db"

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const campaignId = Number(id)
  const campaign =
    Number.isInteger(campaignId) && campaignId > 0
      ? await db.orm.public.Campaign.first({ id: campaignId })
      : null
  if (!campaign)
    return Response.json(
      { ok: false, error: "CAMPAIGN_NOT_FOUND" },
      { status: 404 }
    )

  const base = {
    ok: true,
    onchainStatus: campaign.onchainStatus,
    contractCampaignId: campaign.contractCampaignId,
    vaultAddress: getConfiguredVaultAddress(),
  }
  if (!campaign.contractCampaignId || !campaign.recipientWallet)
    return Response.json({ ...base, active: false, recipientMatches: false })

  try {
    const state = await getCampaignState(campaign.contractCampaignId)
    return Response.json({
      ...base,
      active: state.active,
      recipientMatches:
        state.recipient.toLowerCase() ===
        campaign.recipientWallet.toLowerCase(),
    })
  } catch {
    return Response.json(
      {
        ...base,
        active: false,
        recipientMatches: false,
        error: "CHAIN_STATE_UNAVAILABLE",
      },
      { status: 502 }
    )
  }
}
