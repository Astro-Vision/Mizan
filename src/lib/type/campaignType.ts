export interface AiCampaignDraft {
  title: string
  organizerName: string
  summary: string
  confidenceScore: number
  flaggedReasons: string[]
  matchedDisasterEventId: string | null
}

type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

type campaignCategory = "ZAKAT" | "DONASI_UMUM" | "WAKAF" | "BENCANA"

export interface CreateDraftCampaignInput {
  title: string
  organizerName: string
  aiDraftPayload: { [key: string]: JsonValue }
  aiReference: string
  aiConfidence: number
  targetAmountWei: string
  category: campaignCategory
  summary: string
  location?: string
  days: number
  image?: string
}
