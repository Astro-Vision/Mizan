"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { CampaignReview } from "@/lib/dashboard-data"

/* =========================================================================
   CRUD KAMPANYE — Server Actions
   Saat ini memakai data in-memory (mock).
   Siap disambungkan ke Prisma/Supabase — cukup ganti implementasi di bawah.
   ========================================================================= */

// ── Tipe ────────────────────────────────────────────────────────────────────

export type CampaignFormState = {
  success: boolean
  message: string
  errors?: Record<string, string>
}

// ── Data store (in-memory mock) ─────────────────────────────────────────────

let nextId = 200

const campaigns: CampaignReview[] = [
  {
    id: "kmp-0148",
    judul: "Renovasi mushola dan ruang belajar di Garut",
    penyelenggara: "Yayasan Bangun Desa",
    terkumpul: 0,
    target: 12,
    satuan: "BNB",
    donatur: 0,
    status: "menunggu",
  },
  {
    id: "kmp-0147",
    judul: "Beasiswa hafiz untuk 15 santri di Tasikmalaya",
    penyelenggara: "Pesantren Riyadhul Jannah",
    terkumpul: 0,
    target: 3500,
    satuan: "USDT",
    donatur: 0,
    status: "menunggu",
  },
  {
    id: "kmp-0142",
    judul: "Bantuan pendidikan untuk 40 anak yatim di Lombok Timur",
    penyelenggara: "Yayasan Nurul Iman",
    terkumpul: 12.4,
    target: 20,
    satuan: "BNB",
    donatur: 87,
    status: "aktif",
  },
  {
    id: "kmp-0138",
    judul: "Air bersih untuk 120 kepala keluarga di Sumba Timur",
    penyelenggara: "Komunitas Air Sumba",
    terkumpul: 8.75,
    target: 15,
    satuan: "BNB",
    donatur: 143,
    status: "aktif",
  },
  {
    id: "kmp-0120",
    judul: "Distribusi paket sembako Ramadan di Bekasi",
    penyelenggara: "Forum Zakat Bekasi",
    terkumpul: 5000,
    target: 5000,
    satuan: "USDT",
    donatur: 312,
    status: "selesai",
  },
]

// ── Validasi ────────────────────────────────────────────────────────────────

function validateCampaignForm(formData: FormData): {
  errors: Record<string, string>
  data: {
    judul: string
    penyelenggara: string
    target: number
    satuan: "BNB" | "USDT"
    status: "menunggu" | "aktif" | "selesai"
    terkumpul: number
    donatur: number
  }
} {
  const errors: Record<string, string> = {}

  const judul = (formData.get("judul") as string)?.trim() ?? ""
  const penyelenggara = (formData.get("penyelenggara") as string)?.trim() ?? ""
  const targetStr = (formData.get("target") as string)?.trim() ?? ""
  const satuan = (formData.get("satuan") as string)?.trim() ?? ""
  const status = (formData.get("status") as string)?.trim() ?? ""
  const terkumpulStr = (formData.get("terkumpul") as string)?.trim() ?? "0"
  const donaturStr = (formData.get("donatur") as string)?.trim() ?? "0"

  if (!judul) errors.judul = "Judul kampanye wajib diisi."
  if (!penyelenggara) errors.penyelenggara = "Nama penyelenggara wajib diisi."

  const target = parseFloat(targetStr)
  if (isNaN(target) || target <= 0) errors.target = "Target harus angka positif."

  if (satuan !== "BNB" && satuan !== "USDT") errors.satuan = "Satuan harus BNB atau USDT."

  if (status !== "menunggu" && status !== "aktif" && status !== "selesai")
    errors.status = "Status tidak valid."

  const terkumpul = parseFloat(terkumpulStr)
  if (isNaN(terkumpul) || terkumpul < 0) errors.terkumpul = "Dana terkumpul tidak valid."

  const donatur = parseInt(donaturStr, 10)
  if (isNaN(donatur) || donatur < 0) errors.donatur = "Jumlah donatur tidak valid."

  return {
    errors,
    data: {
      judul,
      penyelenggara,
      target: isNaN(target) ? 0 : target,
      satuan: satuan === "USDT" ? "USDT" : "BNB",
      status: (status as "menunggu" | "aktif" | "selesai") || "menunggu",
      terkumpul: isNaN(terkumpul) ? 0 : terkumpul,
      donatur: isNaN(donatur) ? 0 : donatur,
    },
  }
}

// ── READ ────────────────────────────────────────────────────────────────────

export async function getCampaigns(): Promise<CampaignReview[]> {
  // TODO: Ganti dengan query Prisma/Supabase
  return [...campaigns]
}

export async function getCampaignById(id: string): Promise<CampaignReview | null> {
  // TODO: Ganti dengan query Prisma/Supabase
  return campaigns.find((c) => c.id === id) ?? null
}

// ── CREATE ──────────────────────────────────────────────────────────────────

export async function createCampaign(
  _prevState: CampaignFormState,
  formData: FormData,
): Promise<CampaignFormState> {
  const { errors, data } = validateCampaignForm(formData)

  if (Object.keys(errors).length > 0) {
    return { success: false, message: "Ada kesalahan pada formulir.", errors }
  }

  // TODO: Ganti dengan insert Prisma/Supabase
  const newCampaign: CampaignReview = {
    id: `kmp-${String(nextId++).padStart(4, "0")}`,
    judul: data.judul,
    penyelenggara: data.penyelenggara,
    terkumpul: data.terkumpul,
    target: data.target,
    satuan: data.satuan,
    donatur: data.donatur,
    status: data.status,
  }

  campaigns.unshift(newCampaign)

  revalidatePath("/admin/kampanye")
  redirect("/admin/kampanye")
}

// ── UPDATE ──────────────────────────────────────────────────────────────────

export async function updateCampaign(
  id: string,
  _prevState: CampaignFormState,
  formData: FormData,
): Promise<CampaignFormState> {
  const { errors, data } = validateCampaignForm(formData)

  if (Object.keys(errors).length > 0) {
    return { success: false, message: "Ada kesalahan pada formulir.", errors }
  }

  // TODO: Ganti dengan update Prisma/Supabase
  const idx = campaigns.findIndex((c) => c.id === id)
  if (idx === -1) {
    return { success: false, message: "Kampanye tidak ditemukan." }
  }

  campaigns[idx] = {
    ...campaigns[idx],
    judul: data.judul,
    penyelenggara: data.penyelenggara,
    terkumpul: data.terkumpul,
    target: data.target,
    satuan: data.satuan,
    donatur: data.donatur,
    status: data.status,
  }

  revalidatePath("/admin/kampanye")
  redirect("/admin/kampanye")
}

// ── DELETE ──────────────────────────────────────────────────────────────────

export async function deleteCampaign(id: string): Promise<CampaignFormState> {
  // TODO: Ganti dengan delete Prisma/Supabase
  const idx = campaigns.findIndex((c) => c.id === id)
  if (idx === -1) {
    return { success: false, message: "Kampanye tidak ditemukan." }
  }

  campaigns.splice(idx, 1)

  revalidatePath("/admin/kampanye")
  return { success: true, message: "Kampanye berhasil dihapus." }
}
