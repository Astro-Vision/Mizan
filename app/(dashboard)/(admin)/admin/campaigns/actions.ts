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
import { toCategoryCode, type CampaignCategoryCode } from "@/src/lib/campaign-category"
import { db } from "@/src/prisma/db"
import { requireAdminSession } from "@/src/lib/beneficiary/access"
import { registerCampaignOnChain } from "@/src/lib/chain/campaign-registration"

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

// Category is stored as an enum CODE in the DB (ZAKAT/DONASI_UMUM/WAKAF/BENCANA).
// Accepts a code or a label from the form and returns a valid code.
function normalizeCategoryCode(value: FormDataEntryValue | null): CampaignCategoryCode {
  return toCategoryCode(typeof value === "string" ? value : null) ?? "DONASI_UMUM"
}

function parseDaysLeft(value: FormDataEntryValue | null): number {
  const parsed = Number(typeof value === "string" ? value.trim() : "")
  if (!Number.isFinite(parsed) || parsed < 0) return 0
  // Clamp to a sane upper bound (10 years) and drop fractional days.
  return Math.min(3650, Math.floor(parsed))
}

function validateCampaignForm(formData: FormData) {
  const errors: Record<string, string> = {}
  const title = shortText(formData.get("title") ?? formData.get("judul"), 160)
  const organizerName = shortText(formData.get("organizerName") ?? formData.get("penyelenggara"), 160)
  const targetInput = shortText(formData.get("target"), 40)
  const recipientWallet = shortText(formData.get("recipientWallet"), 42)
  const aiReference = shortText(formData.get("aiReference"), 500)
  const targetAmountWei = decimalBnbToWei(targetInput)

  const category = normalizeCategoryCode(formData.get("category"))
  const location = shortText(formData.get("location"), 160)
  const summary = shortText(formData.get("summary"), 600)
  const image = shortText(formData.get("image"), 1000)
  const daysLeft = parseDaysLeft(formData.get("daysLeft"))

  if (!title) {
    errors.title = "Judul kampanye wajib diisi."
    errors.judul = "Judul kampanye wajib diisi."
  }
  if (!organizerName) {
    errors.organizerName = "Nama penyelenggara wajib diisi."
    errors.penyelenggara = "Nama penyelenggara wajib diisi."
  }
  if (!targetAmountWei || targetAmountWei === "0") {
    errors.target = "Target BNB harus lebih besar dari nol dan maksimal 18 desimal."
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(recipientWallet)) {
    errors.recipientWallet = "Wallet recipient harus address EVM yang valid."
  }
  if (!aiReference) errors.aiReference = "Referensi sumber wajib diisi."
  // Image is optional, but if provided it must look like a URL or a local path.
  if (image && !/^(https?:\/\/|\/)/i.test(image)) {
    errors.image = "Gambar harus berupa URL (http/https) atau path yang diawali /."
  }

  return {
    errors,
    data: {
      title,
      organizerName,
      targetAmountWei: targetAmountWei ?? "0",
      recipientWallet,
      aiReference,
      category,
      location: location || null,
      summary: summary || null,
      image: image || null,
      daysLeft,
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
  status: "ACTIVE" | "COMPLETED" | "CLOSED"
  reviewStatus: CampaignReviewStatus
  source: "AI_MOCK" | "MANUAL"
  aiDraft: unknown | null
  aiReference: string | null
  aiConfidence: number | null
  recipientWallet: string | null
  contractCampaignId: string | null
  contractTransactionHash: string | null
  onchainStatus: "NOT_REGISTERED" | "REGISTERING" | "REGISTERED" | "FAILED"
  onchainRegistrationError: string | null
  category: CampaignCategoryCode | null
  image: string | null
  location: string | null
  summary: string | null
  daysLeft: number
}): CampaignReview {
  return {
    id: String(row.id),
    title: row.title,
    organizerName: row.organizerName,
    raisedAmountWei: row.raisedAmountWei,
    targetAmountWei: row.targetAmountWei,
    currency: row.currency,
    donorCount: row.donorCount,
    status: row.status,
    reviewStatus: row.reviewStatus,
    source: row.source,
    aiDraft: row.aiDraft,
    aiReference: row.aiReference,
    aiConfidence: row.aiConfidence,
    recipientWallet: row.recipientWallet,
    contractCampaignId: row.contractCampaignId,
    contractTransactionHash: row.contractTransactionHash,
    onchainStatus: row.onchainStatus,
    onchainRegistrationError: row.onchainRegistrationError,
    category: row.category ?? "DONASI_UMUM",
    image: row.image,
    location: row.location,
    summary: row.summary,
    daysLeft: row.daysLeft,
    judul: row.title,
    penyelenggara: row.organizerName,
    terkumpul: weiToBnb(row.raisedAmountWei),
    target: weiToBnb(row.targetAmountWei),
    satuan: row.currency,
    donatur: row.donorCount,
  }
}

export async function getCampaigns(): Promise<CampaignReview[]> {
  const rows = await db.orm.public.Campaign.orderBy((c) => c.createdAt.desc()).all()
  return rows.map(toReview)
}

export async function getCampaignById(id: string): Promise<CampaignReview | null> {
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
    status: "ACTIVE",
    source: "AI_MOCK",
    category: data.category,
    location: data.location,
    summary: data.summary,
    image: data.image,
    daysLeft: data.daysLeft,
    aiDraft: {
      title: data.title,
      organizer: data.organizerName,
      targetBnb: data.targetAmountWei,
      recipientWallet: data.recipientWallet,
      generatedBy: "AI_MOCK",
    },
    aiReference: data.aiReference,
    aiConfidence: 0.85,
    reviewStatus: transitionCampaignReviewStatus("AI_DRAFT", "PENDING_REVIEW"),
    recipientWallet: data.recipientWallet.toLowerCase(),
  })

  revalidatePath("/admin/campaigns")
  redirect("/admin/campaigns")
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
    category: data.category,
    location: data.location,
    summary: data.summary,
    image: data.image,
    daysLeft: data.daysLeft,
    aiReference: data.aiReference,
    aiDraft: {
      title: data.title,
      organizer: data.organizerName,
      targetBnb: data.targetAmountWei,
      recipientWallet: data.recipientWallet,
      generatedBy: "AI_MOCK",
    },
    aiConfidence: 0.85,
    reviewStatus: "PENDING_REVIEW",
    status: "ACTIVE",
    rejectionReason: null,
  })

  revalidatePath("/admin/campaigns")
  redirect("/admin/campaigns")
}

export async function approveCampaign(id: string): Promise<CampaignFormState> {
  const numId = Number(id)
  const campaign = Number.isInteger(numId) ? await db.orm.public.Campaign.first({ id: numId }) : null
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
  revalidatePath("/admin/campaigns")
  return { success: true, message: "Campaign disetujui dan siap dipublish." }
}

export async function rejectCampaign(id: string, formData?: FormData): Promise<CampaignFormState> {
  const numId = Number(id)
  const campaign = Number.isInteger(numId) ? await db.orm.public.Campaign.first({ id: numId }) : null
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
  revalidatePath("/admin/campaigns")
  return { success: true, message: "Campaign ditolak." }
}

export async function publishCampaign(id: string): Promise<CampaignFormState> {
  const numId = Number(id)
  const campaign = Number.isInteger(numId) ? await db.orm.public.Campaign.first({ id: numId }) : null
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
  revalidatePath("/admin/campaigns")
  return {
    success: true,
    message: "Campaign aktif dan siap menerima pembayaran.",
  }
}

export async function registerCampaignOnChainAction(id: string): Promise<CampaignFormState> {
  await requireAdminSession()
  const numId = Number(id)
  const campaign = Number.isInteger(numId) ? await db.orm.public.Campaign.first({ id: numId }) : null

  if (!campaign) return { success: false, message: "Kampanye tidak ditemukan." }
  if (campaign.contractCampaignId) return { success: true, message: "Campaign sudah terdaftar on-chain." }
  if (campaign.onchainStatus === "REGISTERING")
    return { success: false, message: "Registrasi on-chain sedang diproses." }
  if (campaign.reviewStatus !== "APPROVED" || campaign.status !== "ACTIVE")
    return { success: false, message: "Campaign harus approved dan aktif." }
  if (!campaign.recipientWallet || !/^0x[a-fA-F0-9]{40}$/.test(campaign.recipientWallet))
    return { success: false, message: "Wallet penerima tidak valid." }
  if (!/^[1-9]\d*$/.test(campaign.targetAmountWei))
    return { success: false, message: "Target campaign harus lebih dari nol." }

  await db.orm.public.Campaign.where((row) => row.id.eq(numId)).update({
    onchainStatus: "REGISTERING",
    onchainRegistrationError: null,
  })

  try {
    const registration = await registerCampaignOnChain({
      campaignId: String(numId),
      externalRef: `mizan:campaign:${numId}`,
      recipient: campaign.recipientWallet,
      targetAmountWei: campaign.targetAmountWei,
    })
    await db.orm.public.Campaign.where((row) => row.id.eq(numId)).update({
      contractCampaignId: registration.contractCampaignId,
      contractTransactionHash: registration.transactionHash,
      onchainStatus: "REGISTERED",
      onchainRegisteredAt: new Date().toISOString(),
    })
    revalidatePath("/admin/campaigns")
    return { success: true, message: "Campaign berhasil didaftarkan on-chain." }
  } catch (cause) {
    const knownMessages = new Set([
      "MIZAN_MANAGER_PRIVATE_KEY belum dikonfigurasi.",
      "Transaksi registrasi campaign gagal.",
    ])
    const message =
      cause instanceof Error && knownMessages.has(cause.message)
        ? cause.message
        : "Registrasi on-chain gagal. Periksa wallet manager, RPC, dan role kontrak."
    await db.orm.public.Campaign.where((row) => row.id.eq(numId)).update({
      onchainStatus: "FAILED",
      onchainRegistrationError: message,
    })
    revalidatePath("/admin/campaigns")
    return { success: false, message }
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
  revalidatePath("/admin/campaigns")
  return { success: true, message: "Kampanye berhasil dihapus." }
}
