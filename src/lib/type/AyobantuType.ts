import { RelatedDisasterEvent } from "./disasterType"

export interface AyobantuType {
  slug: string
  category?: string
  campaignType: string
  collectedAmount: number
  targetAmount: number | null
  daysLeftText?: string
  campaignerUrl?: string
}

export interface AyobantuResult {
  sourceId: string
  slug: string
  title: string
  url: string
  image?: string
  category?: string
  campaignType: string
  collectedAmount: number
  targetAmount: number | null
  location?: string
  campaigner?: string
  campaignerUrl?: string
  verified: boolean
  daysLeftText: number | 0
  summary : string
}

export interface AyobantuStructuredData {
  slug: string
  category?: string
  campaignType: string
  collectedAmount: number
  targetAmount: number | null // null = tidak terbatas
  daysLeftText?: number
  campaignerUrl?: string
}


export interface AyobantuCampaignPromptInput {
  title: string
  url: string | null
  authorName: string | null
  structured: {
    category?: string
    collectedAmount: number
    targetAmount: number | null
    daysLeftText?: number
  }
  relatedEvents: RelatedDisasterEvent[]
}
