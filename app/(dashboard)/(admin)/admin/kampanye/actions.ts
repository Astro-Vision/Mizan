"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { CampaignReview } from "@/src/lib/dashboard-data"
import {
  transitionCampaignReviewStatus,
  type CampaignFormState,
  type CampaignReviewStatus,
} from "@/src/lib/campaign-workflow"
import { decimalBnbToWei } from "@/src/lib/payments/validation"
import { db } from "@/src/prisma/db"

function shortText(value: FormDataEntryValue | null, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : ""
}

// wei (18-decimal string) <-> BNB number, for the admin presentation type.
const WEI = BigInt("1000000000000000000")

function weiToBnb(value: string | null | undefined): number {
  if (!value) return 0
  try {
    return Number((BigInt(value) * BigInt(1_000_000)) / WEI) / 1_000_000
  } catch {
    return 0
  }
}

// DB status (CampaignStatus enum) <-> the Indonesian labels the admin UI uses.
type DbCampaignStatus = "ACTIVE" | "COMPLETED" | "CLOSED"
type UiCampaignStatus = "menunggu" | "aktif" | "selesai"

function dbStatusToUi(
  status: string,
  reviewStatus: CampaignReviewStatus
): UiCampaignStatus {
  // A campaign that isn't approved yet reads as "menunggu" regardless of status.
  if (reviewStatus !== "APPROVED") return "menunggu"
  if (status === "COMPLETED" || status === "CLOSED") return "selesai"
  return "aktif"
}

function validateCampaignForm(formData: FormData) {
  const errors: Record<string, string> = {}
  const title = shortText(formData.get("judul"), 160)
  const organizerName = shortText(formData.get("penyelenggara"), 160)
  const targetInput = shortText(formData.get("target"), 40)
  const recipientWallet = shortText(formData.get("recipientWallet"), 42)
  const aiReference = shortText(formData.get("aiReference"), 500)
  const targetAmountWei = decimalBnbToWei(targetInput)

  if (!title) errors.judul = "Judul kampanye wajib diisi."
  if (!organizerName) errors.penyelenggara = "Nama penyelenggara wajib diisi."
  if (!targetAmountWei || targetAmountWei === "0") {
    errors.target =
      "Target BNB harus lebih besar dari nol dan maksimal 18 desimal."
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(recipientWallet)) {
    errors.recipientWallet = "Wallet recipient harus address EVM yang valid."
  }
  if (!aiReference) errors.aiReference = "Referensi sumber wajib diisi."

  return {
    errors,
    data: {
      title,
      organizerName,
      targetAmountWei: targetAmountWei ?? "0",
      recipientWallet,
      aiReference,
    },
  }
}

function toReview(row: {
  id: number
  title: string
  organizerName: string
  raisedAmountWei: string
  targetAmountWei: string
  currency: string
  donorCount: number
  status: string
  reviewStatus: CampaignReviewStatus
  source: "AI_MOCK"
  aiDraft: unknown | null
  aiReference: string | null
  aiConfidence: number | null
  recipientWallet: string | null
}): CampaignReview {
  return {
    id: String(row.id),
    judul: row.title,
    penyelenggara: row.organizerName,
    terkumpul: weiToBnb(row.raisedAmountWei),
    target: weiToBnb(row.targetAmountWei),
    satuan: (row.currency?.toUpperCase() === "USDT" ? "USDT" : "BNB") as
      "BNB" | "USDT",
    donatur: row.donorCount,
    status: dbStatusToUi(row.status, row.reviewStatus),
    reviewStatus: row.reviewStatus,
    source: row.source,
    aiDraft: row.aiDraft,
    aiReference: row.aiReference,
    aiConfidence: row.aiConfidence,
    recipientWallet: row.recipientWallet,
    targetAmountWei: row.targetAmountWei,
  }
}

export async function getCampaigns(): Promise<CampaignReview[]> {
  const rows = await db.orm.public.Campaign.orderBy((c) =>
    c.createdAt.desc()
  ).all()
  return rows.map(toReview)
}

export async function getCampaignById(
  id: string
): Promise<CampaignReview | null> {
  const numId = Number(id)
  if (!Number.isInteger(numId) || numId <= 0) return null
  const row = await db.orm.public.Campaign.first({ id: numId })
  return row ? toReview(row) : null
}

export async function createMockAiCampaign(
  _prevState: CampaignFormState,
  formData: FormData
): Promise<CampaignFormState> {
  const { errors, data } = validateCampaignForm(formData)
  if (Object.keys(errors).length > 0) {
    return { success: false, message: "Ada kesalahan pada draft AI.", errors }
  }

  await db.orm.public.Campaign.create({
    title: data.title,
    organizerName: data.organizerName,
    raisedAmountWei: "0",
    targetAmountWei: data.targetAmountWei,
    currency: "BNB",
    donorCount: 0,
    // status stays ACTIVE (DB enum); "not yet published" is tracked via reviewStatus.
    status: "ACTIVE",
    source: "AI_MOCK",
    aiDraft: {
      title: data.title,
      organizer: data.organizerName,
      targetWei: data.targetAmountWei,
      recipientWallet: data.recipientWallet,
      generatedBy: "AI_MOCK",
    },
    aiReference: data.aiReference,
    aiConfidence: 0.85,
    reviewStatus: transitionCampaignReviewStatus("AI_DRAFT", "PENDING_REVIEW"),
    recipientWallet: data.recipientWallet.toLowerCase(),
  })

  revalidatePath("/admin/kampanye")
  redirect("/admin/kampanye")
}

export async function updateCampaign(
  id: string,
  _prevState: CampaignFormState,
  formData: FormData
): Promise<CampaignFormState> {
  const { errors, data } = validateCampaignForm(formData)
  if (Object.keys(errors).length > 0) {
    return { success: false, message: "Ada kesalahan pada draft AI.", errors }
  }

  const numId = Number(id)
  if (!Number.isInteger(numId) || numId <= 0) {
    return { success: false, message: "ID kampanye tidak valid." }
  }

  const existing = await db.orm.public.Campaign.first({ id: numId })
  if (!existing) return { success: false, message: "Kampanye tidak ditemukan." }

  await db.orm.public.Campaign.where((c) => c.id.eq(numId)).update({
    title: data.title,
    organizerName: data.organizerName,
    currency: "BNB",
    recipientWallet: data.recipientWallet.toLowerCase(),
    targetAmountWei: data.targetAmountWei,
    aiReference: data.aiReference,
    aiDraft: {
      title: data.title,
      organizer: data.organizerName,
      targetWei: data.targetAmountWei,
      recipientWallet: data.recipientWallet,
      generatedBy: "AI_MOCK",
    },
    aiConfidence: 0.85,
    reviewStatus: "PENDING_REVIEW",
    status: "ACTIVE",
    rejectionReason: null,
  })

  revalidatePath("/admin/kampanye")
  redirect("/admin/kampanye")
}

export async function approveCampaign(id: string): Promise<CampaignFormState> {
  const numId = Number(id)
  const campaign = Number.isInteger(numId)
    ? await db.orm.public.Campaign.first({ id: numId })
    : null
  if (!campaign) return { success: false, message: "Kampanye tidak ditemukan." }

  try {
    transitionCampaignReviewStatus(campaign.reviewStatus, "APPROVED")
  } catch {
    return {
      success: false,
      message: "Hanya campaign pending review yang dapat di-approve.",
    }
  }

  await db.orm.public.Campaign.where((c) => c.id.eq(numId)).update({
    reviewStatus: "APPROVED",
    approvedAt: new Date().toISOString(),
    rejectionReason: null,
  })
  revalidatePath("/admin/kampanye")
  return { success: true, message: "Campaign disetujui dan siap dipublish." }
}

export async function rejectCampaign(
  id: string,
  formData?: FormData
): Promise<CampaignFormState> {
  const numId = Number(id)
  const campaign = Number.isInteger(numId)
    ? await db.orm.public.Campaign.first({ id: numId })
    : null
  if (!campaign) return { success: false, message: "Kampanye tidak ditemukan." }

  try {
    transitionCampaignReviewStatus(campaign.reviewStatus, "REJECTED")
  } catch {
    return {
      success: false,
      message: "Hanya campaign pending review yang dapat ditolak.",
    }
  }

  const reason = shortText(formData?.get("reason") ?? null, 500) || null
  await db.orm.public.Campaign.where((c) => c.id.eq(numId)).update({
    reviewStatus: "REJECTED",
    rejectionReason: reason,
    status: "CLOSED",
  })
  revalidatePath("/admin/kampanye")
  return { success: true, message: "Campaign ditolak." }
}

export async function publishCampaign(id: string): Promise<CampaignFormState> {
  const numId = Number(id)
  const campaign = Number.isInteger(numId)
    ? await db.orm.public.Campaign.first({ id: numId })
    : null
  if (!campaign) return { success: false, message: "Kampanye tidak ditemukan." }
  if (campaign.reviewStatus !== "APPROVED") {
    return {
      success: false,
      message: "Campaign harus approved sebelum dipublish.",
    }
  }

  // Scope 3 only exposes the approved state to the next publishing step.
  await db.orm.public.Campaign.where((c) => c.id.eq(numId)).update({
    status: "ACTIVE",
  })
  revalidatePath("/admin/kampanye")
  return {
    success: true,
    message: "Campaign aktif dan siap menerima pembayaran.",
  }
}

export async function deleteCampaign(id: string): Promise<CampaignFormState> {
  const numId = Number(id)
  if (!Number.isInteger(numId) || numId <= 0) {
    return { success: false, message: "ID kampanye tidak valid." }
  }

  const existing = await db.orm.public.Campaign.first({ id: numId })
  if (!existing) return { success: false, message: "Kampanye tidak ditemukan." }

  await db.orm.public.Campaign.where((c) => c.id.eq(numId)).delete()
  revalidatePath("/admin/kampanye")
  return { success: true, message: "Kampanye berhasil dihapus." }
}
