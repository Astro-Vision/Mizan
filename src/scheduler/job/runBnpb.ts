import { scrapeBNPB } from "@/src/agents/tools/official/scrapeBnpb"
import { createContentHash } from "@/src/lib/hash"
import {
  completeScrapeJob,
  failScrapeJob,
  startScrapeJob
} from "@/src/lib/scrapeHelper"
import { createRawCapture } from "@/src/service/rawCapturedService"
import { createScrapeJob } from "@/src/service/scrapeServices"

export async function runBnpb() {
  const date = new Date()

  const job = await createScrapeJob({
    startDate: date.toISOString(),
    endDate: date.toISOString(),
    totalSources: 1,
  })

  try {
    await startScrapeJob(job.id)

    const results = await scrapeBNPB()

    let created = 0

    for (const item of results) {
      const content = JSON.stringify(item)

      try {
        await createRawCapture({
          sourceId: item.sourceId,
          contentText: content,
          contentHash: createContentHash(content),
        })
        created++
      } catch (error) {
        console.error(
          `Gagal createRawCapture untuk item BNPB:`,
          item.number,
          error
        )
      }
    }

    await completeScrapeJob(job.id)

    return { scraped: results.length, created }
  } catch (error) {
    console.error("[BNPB job] gagal:", error)
    await failScrapeJob(job.id, error)
    throw error
  }
}
