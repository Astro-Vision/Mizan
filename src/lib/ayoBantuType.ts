export interface AyobantuResult {
  sourceId: string
  slug: string
  title: string
  url: string
  image?: string
  category?: string
  campaignType: string        // "normal" | "qurban"
  collectedAmount: number      // dalam Rupiah, contoh 10000000
  targetAmount: number | null   // null = tidak terbatas / unlimited
  campaigner?: string
  campaignerUrl?: string
  verified: boolean
  daysLeftText?: string          // contoh: "10 hari lagi"
}