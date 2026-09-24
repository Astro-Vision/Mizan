import "server-only"

import { createClient } from "@supabase/supabase-js"
import { getStoragePathFromReference } from "./storage-reference"

const BUCKET = "milestone-proofs"
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error("Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)")
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

/**
 * Upload a proof image or PDF to Supabase Storage.
 *
 * @param file  The image/PDF File from the form
 * @param path  Storage path, e.g. `{communityId}/{campaignId}/{milestoneId}/{timestamp}.jpg`
 * @returns     Stable private Storage path of the uploaded file
 */
export async function uploadMilestoneProof(file: File, path: string): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File terlalu besar (maks ${MAX_FILE_SIZE / 1024 / 1024} MB).`)
  }
  if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
    throw new Error("File bukti harus berupa gambar atau PDF.")
  }

  const supabase = getSupabaseAdmin()

  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    })

  if (error) {
    console.error("Supabase Storage upload error:", error)
    throw new Error(`Gagal mengunggah bukti: ${error.message}`)
  }

  return path
}

export async function getMilestoneProofUrl(reference: string): Promise<string> {
  const supabase = getSupabaseAdmin()
  const path = getStoragePathFromReference(reference, BUCKET)
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24)

  if (error || !data?.signedUrl) {
    console.error("Supabase Storage signed URL error:", error)
    throw new Error("URL sementara bukti gagal dibuat.")
  }

  return data.signedUrl
}
