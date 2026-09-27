export interface AiCampaignDraft {
  title: string
  organizerName: string
  summary: string
  confidenceScore: number
  flaggedReasons: string[]
  matchedDisasterEventId: string | null
}

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue }


export interface CreateDraftCampaignInput {
  title: string
  organizerName: string
  aiDraftPayload: { [key: string]: JsonValue }
  aiReference: string
  aiConfidence: number
  targetAmountWei: string
}