import type { Campaign } from "@/lib/site-data"

/* =========================================================================
   DASHBOARD MOCK DATA
   Semua data di sini berjalan di BNB Smart Chain Testnet.
   Nominal, alamat, dan hash bersifat demo — dana tidak nyata.
   ========================================================================= */

// ── Tipe umum ──────────────────────────────────────────────────────────────

export type StatItem = {
  label: string
  value: string
  unit: string
  icon: string // nama ikon lucide-react
}

export type ActivityItem = {
  id: string
  deskripsi: string
  nominal: string
  satuan: "BNB" | "USDT"
  hash: string
  hashShort: string
  waktu: string
}

export type MilestoneItem = {
  tahap: number
  totalTahap: number
  nominal: string
  satuan: "BNB" | "USDT"
  status: "terverifikasi" | "menunggu" | "belum"
  hash?: string
  hashShort?: string
  tanggal?: string
}

export type PenyaluranItem = {
  id: string
  kampanye: string
  penyelenggara: string
  totalDiterima: string
  satuan: "BNB" | "USDT"
  milestones: MilestoneItem[]
}

export type CampaignReview = {
  id: string
  judul: string
  penyelenggara: string
  terkumpul: number
  target: number
  satuan: "BNB" | "USDT"
  donatur: number
  status: "menunggu" | "aktif" | "selesai"
}

export type DonorCampaign = {
  id: string
  judul: string
  penyelenggara: string
  terkumpul: number
  target: number
  satuan: "BNB" | "USDT"
  kontribusi: string
  tanggalDonasi: string
}

// ── Konstanta ──────────────────────────────────────────────────────────────

export const EXPLORER_URL = "https://testnet.bscscan.com"

export function explorerTxUrl(hash: string) {
  return `${EXPLORER_URL}/tx/${hash}`
}

// ── Admin ──────────────────────────────────────────────────────────────────

export const ADMIN_STATS: StatItem[] = [
  {
    label: "Total terkumpul",
    value: "37,35",
    unit: "BNB",
    icon: "Wallet",
  },
  {
    label: "Total tersalur",
    value: "31,10",
    unit: "BNB",
    icon: "ArrowUpRight",
  },
  {
    label: "Kampanye aktif",
    value: "4",
    unit: "kampanye",
    icon: "Megaphone",
  },
  {
    label: "Total donatur",
    value: "503",
    unit: "orang",
    icon: "Users",
  },
]


export const ADMIN_ACTIVITIES: ActivityItem[] = [
  {
    id: "act-001",
    deskripsi: "Donasi masuk ke kampanye Bantuan Pendidikan Lombok",
    nominal: "0,50",
    satuan: "BNB",
    hash: "0x9c41e7b2a034f8901c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b",
    hashShort: "0x9c41…3a4b",
    waktu: "2 menit lalu",
  },
  {
    id: "act-002",
    deskripsi: "Pencairan tahap 2 ke Yayasan Nurul Iman",
    nominal: "3,96",
    satuan: "BNB",
    hash: "0x6de3b880c7a4e591028f3d4c5b6a7980e1f2d3c4b5a69708e9f0a1b2c3d4e5f6",
    hashShort: "0x6de3…e5f6",
    waktu: "1 jam lalu",
  },
  {
    id: "act-003",
    deskripsi: "Kampanye baru diajukan: Renovasi Mushola Garut",
    nominal: "—",
    satuan: "BNB",
    hash: "0x2f80a1c9b3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
    hashShort: "0x2f80…e9f0",
    waktu: "3 jam lalu",
  },
  {
    id: "act-004",
    deskripsi: "Donasi masuk ke kampanye Air Bersih Sumba",
    nominal: "1,20",
    satuan: "BNB",
    hash: "0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
    hashShort: "0xa1b2…a1b2",
    waktu: "5 jam lalu",
  },
  {
    id: "act-005",
    deskripsi: "Bukti penyaluran diunggah untuk kampanye Sembako Bekasi",
    nominal: "—",
    satuan: "USDT",
    hash: "0xf0e1d2c3b4a5968778695a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3",
    hashShort: "0xf0e1…c4d3",
    waktu: "1 hari lalu",
  },
]

// ── Navigasi sidebar ───────────────────────────────────────────────────────

export type NavItem = {
  label: string
  href: string
  icon: string
  badge?: number
}

export const ADMIN_NAV: NavItem[] = [
  { label: "Ringkasan", href: "/admin", icon: "LayoutDashboard" },
  { label: "Kampanye", href: "/admin/kampanye", icon: "Megaphone", badge: 2 },
  { label: "Penyaluran", href: "/admin/penyaluran", icon: "ArrowUpRight" },
  { label: "Donatur", href: "/admin/donatur", icon: "Users" },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: "Settings" },
]

export const BENEFACTOR_NAV: NavItem[] = [
  { label: "Ringkasan", href: "/donatur", icon: "LayoutDashboard" },
  { label: "Donasi Saya", href: "/donatur/riwayat", icon: "History" },
  { label: "Jelajahi Kampanye", href: "/donatur/jelajahi", icon: "Search" },
  { label: "Pengaturan", href: "/donatur/pengaturan", icon: "Settings" },
]

export const BENEFICIARY_NAV: NavItem[] = [
  { label: "Ringkasan", href: "/penerima", icon: "LayoutDashboard" },
  { label: "Penyaluran", href: "/penerima/penyaluran", icon: "ArrowDownLeft" },
  { label: "Kampanye Saya", href: "/penerima/kampanye", icon: "Megaphone" },
  { label: "Pengaturan", href: "/penerima/pengaturan", icon: "Settings" },
]

// ── Benefactor (Donatur) ───────────────────────────────────────────────────

export const BENEFACTOR_WALLET = {
  address: "0x4d2A7B8c9E1f3a5D6e8F0b2C4d6E8f10",
  addressShort: "0x4d2A…8f10",
}

export const BENEFACTOR_STATS: StatItem[] = [
  {
    label: "Total didonasikan",
    value: "2,85",
    unit: "BNB",
    icon: "Heart",
  },
  {
    label: "Kampanye didukung",
    value: "3",
    unit: "kampanye",
    icon: "Megaphone",
  },
  {
    label: "Rata-rata donasi",
    value: "0,95",
    unit: "BNB",
    icon: "TrendingUp",
  },
]

export const BENEFACTOR_CAMPAIGNS: DonorCampaign[] = [
  {
    id: "kmp-0142",
    judul: "Bantuan pendidikan untuk 40 anak yatim di Lombok Timur",
    penyelenggara: "Yayasan Nurul Iman",
    terkumpul: 12.4,
    target: 20,
    satuan: "BNB",
    kontribusi: "0,50",
    tanggalDonasi: "12 Sep 2026",
  },
  {
    id: "kmp-0138",
    judul: "Air bersih untuk 120 kepala keluarga di Sumba Timur",
    penyelenggara: "Komunitas Air Sumba",
    terkumpul: 8.75,
    target: 15,
    satuan: "BNB",
    kontribusi: "1,20",
    tanggalDonasi: "8 Sep 2026",
  },
  {
    id: "kmp-0131",
    judul: "Modal usaha untuk 25 ibu tunggal di Bantul",
    penyelenggara: "Amanah Mikro",
    terkumpul: 4200,
    target: 6000,
    satuan: "USDT",
    kontribusi: "1,15",
    tanggalDonasi: "1 Sep 2026",
  },
]

export const BENEFACTOR_ACTIVITIES: ActivityItem[] = [
  {
    id: "bact-001",
    deskripsi: "Donasi ke Bantuan Pendidikan Lombok",
    nominal: "0,50",
    satuan: "BNB",
    hash: "0x9c41e7b2a034f8901c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b",
    hashShort: "0x9c41…3a4b",
    waktu: "12 Sep 2026",
  },
  {
    id: "bact-002",
    deskripsi: "Donasi ke Air Bersih Sumba",
    nominal: "1,20",
    satuan: "BNB",
    hash: "0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
    hashShort: "0xa1b2…a1b2",
    waktu: "8 Sep 2026",
  },
  {
    id: "bact-003",
    deskripsi: "Donasi ke Modal Usaha Bantul",
    nominal: "1,15",
    satuan: "BNB",
    hash: "0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
    hashShort: "0xb2c3…b2c3",
    waktu: "1 Sep 2026",
  },
]

// ── Beneficiary (Penerima) ─────────────────────────────────────────────────

export const BENEFICIARY_WALLET = {
  address: "0xB15c3D4e5F6a7B8C9d0E1f2A3b4C5D6E2e77",
  addressShort: "0xB15c…2e77",
}

export const BENEFICIARY_STATS: StatItem[] = [
  {
    label: "Total diterima",
    value: "3,96",
    unit: "BNB",
    icon: "ArrowDownLeft",
  },
  {
    label: "Milestone terverifikasi",
    value: "2 dari 3",
    unit: "milestone",
    icon: "ShieldCheck",
  },
  {
    label: "Kampanye aktif",
    value: "1",
    unit: "kampanye",
    icon: "Megaphone",
  },
]

export const BENEFICIARY_PENYALURAN: PenyaluranItem[] = [
  {
    id: "pyn-001",
    kampanye: "Bantuan pendidikan untuk 40 anak yatim di Lombok Timur",
    penyelenggara: "Yayasan Nurul Iman",
    totalDiterima: "3,96",
    satuan: "BNB",
    milestones: [
      {
        tahap: 1,
        totalTahap: 3,
        nominal: "1,98",
        satuan: "BNB",
        status: "terverifikasi",
        hash: "0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b",
        hashShort: "0x3a4b…3a4b",
        tanggal: "14 Jul 2026",
      },
      {
        tahap: 2,
        totalTahap: 3,
        nominal: "1,98",
        satuan: "BNB",
        status: "terverifikasi",
        hash: "0x6de3b880c7a4e591028f3d4c5b6a7980e1f2d3c4b5a69708e9f0a1b2c3d4e5f6",
        hashShort: "0x6de3…e5f6",
        tanggal: "14 Agu 2026",
      },
      {
        tahap: 3,
        totalTahap: 3,
        nominal: "—",
        satuan: "BNB",
        status: "menunggu",
      },
    ],
  },
]
