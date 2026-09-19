"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { CampaignReview } from "@/src/lib/dashboard-data"
import { db } from "@/src/prisma/db"

/* =========================================================================
   CRUD KAMPANYE — Server Actions
   Menggunakan Prisma ORM untuk query ke database.
   ========================================================================= */

// ── Tipe ────────────────────────────────────────────────────────────────────

export type CampaignFormState = {
  success: boolean
  message: string
  errors?: Record<string, string>
}

// ── Helper: mapping DB row → CampaignReview ─────────────────────────────────

function toReview(row: {
  id: number
  judul: string
  penyelenggara: string
  terkumpul: number
  target: number
  satuan: string
  donatur: number
  status: string
}): CampaignReview {
  return {
    id: String(row.id),
    judul: row.judul,
    penyelenggara: row.penyelenggara,
    terkumpul: row.terkumpul,
    target: row.target,
    satuan: row.satuan as "BNB" | "USDT",
    donatur: row.donatur,
    status: row.status as "menunggu" | "aktif" | "selesai",
  }
}

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
  const rows = await db.orm.public.Campaign
    .orderBy((c) => c.createdAt.desc())
    .all()
  return rows.map(toReview)
}

export async function getCampaignById(id: string): Promise<CampaignReview | null> {
  const numId = Number(id)
  if (isNaN(numId)) return null

  const row = await db.orm.public.Campaign.first({ id: numId })
  return row ? toReview(row) : null
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

  await db.orm.public.Campaign.create({
    judul: data.judul,
    penyelenggara: data.penyelenggara,
    terkumpul: data.terkumpul,
    target: data.target,
    satuan: data.satuan,
    donatur: data.donatur,
    status: data.status,
  })

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

  const numId = Number(id)
  if (isNaN(numId)) {
    return { success: false, message: "ID kampanye tidak valid." }
  }

  const existing = await db.orm.public.Campaign.first({ id: numId })
  if (!existing) {
    return { success: false, message: "Kampanye tidak ditemukan." }
  }

  await db.orm.public.Campaign
    .where((c) => c.id.eq(numId))
    .update({
      judul: data.judul,
      penyelenggara: data.penyelenggara,
      terkumpul: data.terkumpul,
      target: data.target,
      satuan: data.satuan,
      donatur: data.donatur,
      status: data.status,
    })

  revalidatePath("/admin/kampanye")
  redirect("/admin/kampanye")
}

// ── DELETE ──────────────────────────────────────────────────────────────────

export async function deleteCampaign(id: string): Promise<CampaignFormState> {
  const numId = Number(id)
  if (isNaN(numId)) {
    return { success: false, message: "ID kampanye tidak valid." }
  }

  const existing = await db.orm.public.Campaign.first({ id: numId })
  if (!existing) {
    return { success: false, message: "Kampanye tidak ditemukan." }
  }

  await db.orm.public.Campaign
    .where((c) => c.id.eq(numId))
    .delete()

  revalidatePath("/admin/kampanye")
  return { success: true, message: "Kampanye berhasil dihapus." }
}

