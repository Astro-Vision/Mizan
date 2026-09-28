export interface AiCampaignDraft {
  title: string
  organizerName: string
  summary: string
  confidenceScore: number   // 0-1
  flaggedReasons: string[]
  matchedDisasterEventId: string | null
}


export function validateAiCampaignDraft(
  raw: unknown,
  candidateEventIds: string[]
): AiCampaignDraft | null {
  if (typeof raw !== "object" || raw === null) {
    return null
  }

  const r = raw as Record<string, unknown>

  if (typeof r.title !== "string" || !r.title.trim()) return null
  if (typeof r.organizerName !== "string" || !r.organizerName.trim()) return null
  if (typeof r.summary !== "string") return null
  if (
    typeof r.confidenceScore !== "number" ||
    Number.isNaN(r.confidenceScore) ||
    r.confidenceScore < 0 ||
    r.confidenceScore > 1
  ) {
    return null
  }
  if (!Array.isArray(r.flaggedReasons) || !r.flaggedReasons.every((f) => typeof f === "string")) {
    return null
  }

  const flaggedReasons = [...(r.flaggedReasons as string[])]
  let matchedDisasterEventId: string | null = null

  const rawMatchedId = r.matchedDisasterEventId
  if (rawMatchedId !== null && rawMatchedId !== undefined) {
    if (typeof rawMatchedId !== "string") {
      flaggedReasons.push("AI mengembalikan matchedDisasterEventId dengan tipe tidak valid, diabaikan")
    } else if (!candidateEventIds.includes(rawMatchedId)) {
      flaggedReasons.push(
        `AI mengembalikan matchedDisasterEventId ("${rawMatchedId}") yang tidak ada di daftar kandidat, diabaikan`
      )
    } else {
      matchedDisasterEventId = rawMatchedId
    }
  }

  return {
    title: r.title.trim(),
    organizerName: r.organizerName.trim(),
    summary: r.summary,
    confidenceScore: r.confidenceScore,
    flaggedReasons,
    matchedDisasterEventId,
  }
}