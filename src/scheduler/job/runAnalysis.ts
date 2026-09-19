import { openRouter } from "@/src/lib/openRouter"
import { db } from "@/src/prisma/db"
import { DisasterType, saveAnalysis } from "@/src/service/analysisServices"
import {
  completeScrapeJob,
  failScrapeJob,
  startScrapeJob,
} from "@/src/lib/scrapeHelper"
import { createScrapeJob } from "@/src/service/scrapeServices"
import { ValidationStatus } from "@/src/service/disasterEvent"
import { DISASTER_AGENT_PROMPT } from "@/src/lib/prompt"

const BATCH_SIZE = 10

const EVENT_PRIORITY: Record<string, number> = {
  OFFICIAL_CONFIRMED: 3,
  CORROBORATED: 2,
  UNVERIFIED: 1,
  REJECTED: 0,
}

async function findOrLinkDisasterEvent(analysis: {
  rawCaptureId: string
  disasterType: DisasterType
  province?: string
  locationName?: string
  validationStatus: ValidationStatus
  officialConfirmed: boolean
  title: string
  description?: string
}) {
  if (analysis.validationStatus === "REJECTED") return

  const existingEvent = await db.orm.public.DisasterEvent.where({
    disasterType: analysis.disasterType,
    province: analysis.province,
  }).first()

  if (existingEvent) {
    const shouldUpgrade =
      (EVENT_PRIORITY[analysis.validationStatus] ?? 0) >
      (EVENT_PRIORITY[existingEvent.validationStatus] ?? 0)

    if (shouldUpgrade) {
      await db.orm.public.DisasterEvent.where({ id: existingEvent.id }).update({
        validationStatus: analysis.validationStatus,
        officialConfirmed:
          analysis.officialConfirmed || existingEvent.officialConfirmed,
      })
    }

    await db.orm.public.Analysis.where({
      rawCaptureId: analysis.rawCaptureId,
    }).update({ eventId: existingEvent.id })
  } else {
    const newEvent = await db.orm.public.DisasterEvent.create({
      disasterType: analysis.disasterType,
      title: analysis.title,
      description: analysis.description,
      validationStatus: analysis.validationStatus,
      locationName: analysis.locationName,
      province: analysis.province,
      officialConfirmed: analysis.officialConfirmed,
    })

    await db.orm.public.Analysis.where({
      rawCaptureId: analysis.rawCaptureId,
    }).update({ eventId: newEvent.id })
  }
}

export async function runAnalysis() {
  const date = new Date()

  const job = await createScrapeJob({
    startDate: date.toISOString(),
    endDate: date.toISOString(),
    totalSources: 0,
  })

  try {
    await startScrapeJob(job.id)

    const unanalyzed = await db.orm.public.RawCapture.where((rc) =>
      rc.analysis.none()
    )
      .include("source")
      .limit(BATCH_SIZE)
      .all()

    if (unanalyzed.length === 0) {
      console.log("[analysis job] tidak ada capture baru untuk dianalisis")
      await completeScrapeJob(job.id)
      return { processed: 0, saved: 0 }
    }

    const rawData = {
      captures: unanalyzed.map((c) => ({
        rawCaptureId: c.id,
        sourceType: c.source.name,
        contentText: c.contentText,
      })),
    }

    const response = await openRouter.chat.completions.create({
      model: "inclusionai/ling-3.0-flash-vl:free",
      messages: [
        { role: "system", content: DISASTER_AGENT_PROMPT },
        { role: "user", content: JSON.stringify(rawData) },
      ],
    })

    const message = response.choices[0]?.message

    if (!message?.content) {
      throw new Error("AI tidak mengembalikan hasil analisis")
    }

    const parsed = JSON.parse(message.content)

    let saved = 0

    for (const item of parsed) {
      if (
        !item.rawCaptureId ||
        !unanalyzed.some((c) => c.id === item.rawCaptureId)
      ) {
        console.error("rawCaptureId tidak valid:", item)
        continue
      }

      try {
        await saveAnalysis({
          rawCaptureId: item.rawCaptureId,
          isDisaster: item.isDisaster,
          disasterType: item.disasterType,
          confidenceScore: item.confidenceScore,
          extractedLocation: {
            locationName: item.locationName,
            province: item.province,
          },
        })
        saved++

        if (item.isDisaster) {
          await findOrLinkDisasterEvent(item)
        }
      } catch (err) {
        console.error(`Gagal saveAnalysis untuk ${item.rawCaptureId}:`, err)
      }
    }

    await completeScrapeJob(job.id)

    console.log(
      `[analysis job] processed: ${unanalyzed.length}, saved: ${saved}`
    )

    return { processed: unanalyzed.length, saved }
  } catch (error) {
    console.error("[analysis job] gagal:", error)
    await failScrapeJob(job.id, error)
    throw error
  }
}