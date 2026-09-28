import * as cheerio from "cheerio"

function cleanCampaignTitle(title: string): string {
  return title
    .replace(/\s+/g, " ")
    .replace(/\s+\|\s+AyoBantu.*$/i, "")
    .replace(/\s+-\s+AyoBantu.*$/i, "")
    .trim()
}


export async function getFullCampaignTitle(
  url: string,
  fallbackTitle: string
): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
        Accept: "text/html",
      },
    })

    if (!response.ok) {
      console.warn(
        `[AyoBantu] gagal fetch detail title ${url}: ${response.status}`
      )

      return fallbackTitle
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    /**
     * Prioritas:
     *
     * 1. og:title
     * 2. twitter:title
     * 3. <title>
     * 4. heading campaign
     * 5. fallback dari listing
     */

    const ogTitle = $('meta[property="og:title"]').attr("content")?.trim()

    if (ogTitle && !ogTitle.endsWith("...")) {
      return cleanCampaignTitle(ogTitle)
    }

    const twitterTitle = $('meta[name="twitter:title"]').attr("content")?.trim()

    if (twitterTitle && !twitterTitle.endsWith("...")) {
      return cleanCampaignTitle(twitterTitle)
    }

    const documentTitle = $("title").first().text().trim()

    if (documentTitle && !documentTitle.endsWith("...")) {
      return cleanCampaignTitle(documentTitle)
    }

    const heading = $("h1, h2, h3, h4, h5, h6")
      .filter((_, el) => {
        const text = $(el).text().trim()

        return (
          text.length > 0 &&
          !text.toLowerCase().includes("donasi") &&
          !text.toLowerCase().includes("terkumpul")
        )
      })
      .first()
      .text()
      .trim()

    if (heading && !heading.endsWith("...")) {
      return cleanCampaignTitle(heading)
    }

    return fallbackTitle
  } catch (error) {
    console.warn(`[AyoBantu] gagal mengambil full title ${url}:`, error)

    return fallbackTitle
  }
}