import "server-only"

import { db } from "@/src/prisma/db"
import type { Campaign } from "@/src/lib/site-data"

/* =========================================================================
   Server data-access for the PUBLIC campaign pages (list + detail).

   Reads live rows from `db.orm.public.Campaign` (Prisma 8) and maps them to
   the `Campaign` shape the campaign card / detail components already consume.
   Only APPROVED + ACTIVE campaigns are exposed publicly, newest first.
   ========================================================================= */

const DEFAULT_COVER = "/background-hero.png"

// Categories the public filter understands. Anything unknown falls back to
// "Donasi Umum" so the UI never renders an orphan filter chip.
export const CAMPAIGN_CATEGORIES = [
  "Zakat",
  "Donasi Umum",
  "Wakaf",
  "Tanggap Bencana",
] as const

export type CampaignCategory = (typeof CAMPAIGN_CATEGORIES)[number]

function normalizeCategory(value: string | null | undefined): CampaignCategory {
  const found = CAMPAIGN_CATEGORIES.find(
    (category) => category.toLowerCase() === (value ?? "").trim().toLowerCase(),
  )
  return found ?? "Donasi Umum"
}

// wei (18-decimal string) -> a plain BNB number the card math can use.
// Kept lossy-but-safe: BNB amounts on testnet are small, well within Number.
function weiToBnbNumber(value: string | null | undefined): number {
  if (!value) return 0
  try {
    const wei = BigInt(value)
    // Scale by 1e6 first to keep 6 fractional digits, then divide back.
    const scaled = Number((wei * BigInt(1_000_000)) / BigInt("1000000000000000000"))
    return scaled / 1_000_000
  } catch {
    return 0
  }
}

// The card's `satuan` union is BNB | USDT; the DB `currency` is free text.
function toSatuan(currency: string | null | undefined): Campaign["satuan"] {
  return (currency ?? "").toUpperCase() === "USDT" ? "USDT" : "BNB"
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "MZ"
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase()
}

// The shape returned by `db.orm.public.Campaign` reads we perform below.
type CampaignRow = {
  id: number
  title: string
  organizerName: string
  category: string
  image: string | null
  location: string | null
  summary: string | null
  daysLeft: number
  raisedAmountWei: string
  targetAmountWei: string
  currency: string
  donorCount: number
  reviewStatus: string
}

function toCard(row: CampaignRow): Campaign {
  const organizer = row.organizerName || "Komunitas Mizan"

  return {
    id: String(row.id),
    kategori: normalizeCategory(row.category),
    judul: row.title,
    penyelenggara: organizer,
    lokasi: row.location ?? "Indonesia",
    terkumpul: weiToBnbNumber(row.raisedAmountWei),
    target: weiToBnbNumber(row.targetAmountWei),
    satuan: toSatuan(row.currency),
    donatur: row.donorCount,
    sisaHari: row.daysLeft,
    terverifikasi: row.reviewStatus === "APPROVED",
    ringkas: row.summary ?? "",
    gambar: row.image || DEFAULT_COVER,
    komunitas: {
      nama: organizer,
      tipe: "Komunitas terverifikasi",
      bio: row.summary
        ? row.summary
        : `${organizer} mengelola penyaluran kampanye ini secara transparan di on-chain.`,
      inisial: initials(organizer),
    },
  }
}

const PUBLIC_SELECT = [
  "id",
  "title",
  "organizerName",
  "category",
  "image",
  "location",
  "summary",
  "daysLeft",
  "raisedAmountWei",
  "targetAmountWei",
  "currency",
  "donorCount",
  "reviewStatus",
] as const

/**
 * All publicly visible campaigns (APPROVED + ACTIVE), newest first.
 */
export async function getPublicCampaigns(): Promise<Campaign[]> {
  const rows = await db.orm.public.Campaign
    .select(...PUBLIC_SELECT)
    .where({ reviewStatus: "APPROVED", status: "ACTIVE" })
    .orderBy((campaign) => campaign.createdAt.desc())
    .all()

  return rows.map((row) => toCard(row as CampaignRow))
}

/**
 * A single public campaign by its numeric id. Returns null when the id is
 * invalid, the campaign does not exist, or it is not publicly visible.
 */
export async function getPublicCampaignById(id: string): Promise<Campaign | null> {
  const numId = Number(id)
  if (!Number.isInteger(numId) || numId <= 0) return null

  const row = await db.orm.public.Campaign
    .select(...PUBLIC_SELECT, "status")
    .where({ id: numId })
    .first()

  if (!row) return null
  if (row.reviewStatus !== "APPROVED" || row.status !== "ACTIVE") return null

  return toCard(row as CampaignRow)
}
