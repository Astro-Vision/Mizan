import { db } from "../../../prisma/db"
import * as cheerio from "cheerio"
import { createContentHash } from "../../../lib/hash"
import { AyobantuResult } from "@/src/lib/ayoBantuType"

const AYOBANTU_BASE_URL = "https://ayobantu.com/campaign"

export interface scrapeAyobantuInput {
  category?: string        
  status?: string           
  campaignType?: string    
  sort?: string             
  maxPages?: number         
}

function parseRupiah(text: string): number | null {
  if (!text) return null
  if (/tidak terbatas|∞/i.test(text)) return null

  const digits = text.replace(/[^\d]/g, "")
  return digits ? parseInt(digits, 10) : 0
}

function buildQuery(input?: scrapeAyobantuInput, page?: number): string {
  const params = new URLSearchParams()
  if (input?.category) params.set("category", input.category)
  if (input?.status) params.set("status", input.status)
  if (input?.campaignType) params.set("campaign_type", input.campaignType)
  if (input?.sort) params.set("sort", input.sort)
  if (page && page > 1) params.set("page", String(page))
  return params.toString()
}

export async function scrapeAyobantu(
  input?: scrapeAyobantuInput
): Promise<AyobantuResult[]> {
  const sources = await db.orm.public.Source.where({
    dataFormats: "HTML",
    isActive: true,
  }).all()

  const rawResults: AyobantuResult[] = []
  const maxPages = input?.maxPages ?? 20

  for (const source of sources) {
    let page = 1
    let hasNextPage = true

    while (hasNextPage && page <= maxPages) {
      const query = buildQuery(input, page)
      const targetUrl = query
        ? `${AYOBANTU_BASE_URL}?${query}`
        : AYOBANTU_BASE_URL

      const response = await fetch(targetUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          Accept: "text/html",
        },
      })

      if (!response.ok) {
        console.error(`Failed to fetch ${source.name} (page ${page}): ${response.status}`)
        break
      }

      const html = await response.text()
      const $ = cheerio.load(html)

      $('a[href$="/donate"]').each((_, donateEl) => {
        const $donate = $(donateEl)
        const $card = $donate.closest("div")

        const $titleLink = $card
          .find('a[href*="/campaign/"]')
          .filter((_, el) => {
            const href = $(el).attr("href") || ""
            return (
              !href.endsWith("/donate") &&
              !href.includes("?campaigner=") &&
              $(el).find("h6, h5, strong").length > 0
            )
          })
          .first()

        const title = $titleLink.text().trim()
        const url = $titleLink.attr("href") || ""
        const slug = url.split("/campaign/")[1]?.split(/[/?]/)[0] || ""

        if (!title || !url || !slug) {
          return
        }

        const image =
          $card.find('a[href*="/campaign/"] img').first().attr("src") || undefined

        const category = $card
          .find("a, div")
          .filter((_, el) => {
            const t = $(el).text().trim()
            return (
              t.length > 0 &&
              t.length < 30 &&
              !t.includes("Rp") &&
              !t.toLowerCase().includes("donasi")
            )
          })
          .first()
          .text()
          .trim()

        const cardText = $card.text()

        const collectedMatch = cardText.match(/Rp[\s.\d]+terkumpul/)
        const targetMatch = cardText.match(/dari\s+(Rp[\s.\d]+|∞\s*tidak terbatas)/)
        const daysMatch = cardText.match(/\d+\s*hari lagi/)

        const $campaignerLink = $card.find('a[href*="?campaigner="]').first()
        const campaigner = $campaignerLink.text().trim() || undefined
        const campaignerUrl = $campaignerLink.attr("href") || undefined

        const verified = $card.find('img[alt="Verified User"]').length > 0

        rawResults.push({
          sourceId: source.id,
          slug,
          title,
          url: url.startsWith("http") ? url : `https://ayobantu.com${url.startsWith("/") ? url : `/${url}`}`,
          image,
          category: category || undefined,
          campaignType: input?.campaignType || "normal",
          collectedAmount: parseRupiah(collectedMatch?.[0] || "") ?? 0,
          targetAmount: parseRupiah(targetMatch?.[1] || ""),
          campaigner,
          campaignerUrl,
          verified,
          daysLeftText: daysMatch?.[0],
        })
      })

      hasNextPage = $('a:contains("Next")').length > 0
      page += 1
    }
  }

  if (rawResults.length === 0) {
    return []
  }

  const itemsWithHash = rawResults.map((item) => ({
    item,
    hash: createContentHash(JSON.stringify(item)),
  }))

  const allHashes = itemsWithHash.map((x) => x.hash)

  const existingRecords = await db.orm.public.RawCapture.where((rc) =>
    rc.contentHash.in(allHashes)
  ).all()

  const existingHashSet = new Set(existingRecords.map((r) => r.contentHash))

  const newItems = itemsWithHash.filter((x) => !existingHashSet.has(x.hash))

  console.log(
    `Ayobantu: ${rawResults.length} total, ${newItems.length} baru, ${
      rawResults.length - newItems.length
    } sudah ada (skip)`
  )

  return newItems.map((x) => x.item)
}