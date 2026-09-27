import { callWithFallback } from "@/src/agents/callWithFallBackModel"
import { buildAyobantuCampaignPrompt } from "../prompt/ayoBantuPrompt"
import { RelatedDisasterEvent } from "../type/disasterType"
import { CampaignExtraction } from "./extractCampaign"

/**
 * AI Agent 2:
 * Membandingkan campaign AyoBantu dengan kandidat DisasterEvent
 * yang sudah lolos validasi sebelumnya.
 *
 * Agent ini:
 * - tidak memvalidasi apakah bencana benar-benar terjadi
 * - tidak memvalidasi legalitas fundraiser
 * - tidak menentukan apakah campaign legitimate
 * - hanya menghasilkan draft + kecocokan terhadap kandidat event
 *
 * Bentuk & business rule divalidasi terpisah oleh validateAiCampaignDraft().
 */
export async function aiCampaign(input: {
  extraction: CampaignExtraction
  url: string | null
  relatedEvents: RelatedDisasterEvent[]
}): Promise<unknown | null> {
  const prompt = buildAyobantuCampaignPrompt({
    title: input.extraction.title,
    url: input.url,
    authorName: input.extraction.campaigner,
    structured: {
      category: input.extraction.category ?? undefined,
      collectedAmount: input.extraction.collectedAmount,
      targetAmount: input.extraction.targetAmount,
      daysLeftText: input.extraction.daysLeftText ?? undefined,
    },
    relatedEvents: input.relatedEvents,
  })

  const messageContent = await callWithFallback(prompt)

  if (!messageContent) {
    console.error("[aiCampaign] semua model gagal / message content kosong")
    return null
  }

  const cleaned = messageContent
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim()

  // 1. Coba JSON murni terlebih dahulu
  try {
    return JSON.parse(cleaned)
  } catch {
    console.warn(
      "[aiCampaign] response bukan JSON murni, mencoba extract JSON..."
    )
  }

  // 2. Fallback kalau model menambahkan teks/reasoning sebelum JSON
  const start = cleaned.indexOf("{")
  const end = cleaned.lastIndexOf("}")

  if (start === -1 || end === -1 || end <= start) {
    console.error(
      "[aiCampaign] JSON object tidak ditemukan:",
      cleaned.slice(0, 500)
    )

    return null
  }

  const jsonText = cleaned.slice(start, end + 1)

  try {
    return JSON.parse(jsonText)
  } catch {
    console.error(
      "[aiCampaign] JSON ditemukan tetapi invalid:",
      jsonText.slice(0, 500)
    )

    return null
  }
}
