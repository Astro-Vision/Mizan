"use client"

import * as React from "react"
import { useActionState } from "react"
import Link from "next/link"
import { cn } from "@/src/lib/utils"
import type { CampaignReview } from "@/src/lib/dashboard-data"
import type { CampaignFormState } from "@/app/(dashboard)/(admin)/admin/kampanye/actions"

type CampaignFormProps = {
  /** Server Action yang menerima (prevState, formData) */
  action: (state: CampaignFormState, formData: FormData) => Promise<CampaignFormState>
  /** Data kampanye untuk mode edit — null untuk mode tambah */
  initialData?: CampaignReview | null
  /** Label tombol submit */
  submitLabel?: string
}

const INITIAL_STATE: CampaignFormState = {
  success: false,
  message: "",
}

/**
 * Form kampanye — dipakai untuk tambah maupun edit.
 */
export function CampaignForm({
  action,
  initialData,
  submitLabel = "Simpan",
}: CampaignFormProps) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE)

  return (
    <form action={formAction} className="space-y-6">
      {/* Pesan error global */}
      {state.message && !state.success ? (
        <div className="rounded-[6px] border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300">
          {state.message}
        </div>
      ) : null}

      {/* Judul */}
      <div>
        <label htmlFor="judul" className="mb-1.5 block text-sm font-medium text-ink">
          Judul kampanye
        </label>
        <input
          id="judul"
          name="judul"
          type="text"
          required
          defaultValue={initialData?.judul ?? ""}
          placeholder="Contoh: Bantuan pendidikan untuk 40 anak yatim"
          className={cn(
            "h-12 w-full rounded-[6px] border bg-surface px-4 text-sm text-ink outline-none transition-colors duration-150",
            "border-line-ui focus:border-brand-700 focus:ring-2 focus:ring-brand-100",
            "placeholder:text-ink-muted",
            state.errors?.judul && "border-brand-500",
          )}
        />
        {state.errors?.judul ? (
          <p className="mt-1 text-xs text-brand-500">{state.errors.judul}</p>
        ) : null}
      </div>

      {/* Penyelenggara */}
      <div>
        <label htmlFor="penyelenggara" className="mb-1.5 block text-sm font-medium text-ink">
          Penyelenggara
        </label>
        <input
          id="penyelenggara"
          name="penyelenggara"
          type="text"
          required
          defaultValue={initialData?.penyelenggara ?? ""}
          placeholder="Contoh: Yayasan Nurul Iman"
          className={cn(
            "h-12 w-full rounded-[6px] border bg-surface px-4 text-sm text-ink outline-none transition-colors duration-150",
            "border-line-ui focus:border-brand-700 focus:ring-2 focus:ring-brand-100",
            "placeholder:text-ink-muted",
            state.errors?.penyelenggara && "border-brand-500",
          )}
        />
        {state.errors?.penyelenggara ? (
          <p className="mt-1 text-xs text-brand-500">{state.errors.penyelenggara}</p>
        ) : null}
      </div>

      {/* Target + Satuan — satu baris */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="target" className="mb-1.5 block text-sm font-medium text-ink">
            Target dana
          </label>
          <input
            id="target"
            name="target"
            type="number"
            step="any"
            min="0.01"
            required
            defaultValue={initialData?.target ?? ""}
            placeholder="0.00"
            className={cn(
              "h-12 w-full rounded-[6px] border bg-surface px-4 font-mono text-sm tabular-nums text-ink outline-none transition-colors duration-150",
              "border-line-ui focus:border-brand-700 focus:ring-2 focus:ring-brand-100",
              "placeholder:text-ink-muted",
              state.errors?.target && "border-brand-500",
            )}
          />
          {state.errors?.target ? (
            <p className="mt-1 text-xs text-brand-500">{state.errors.target}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="satuan" className="mb-1.5 block text-sm font-medium text-ink">
            Satuan
          </label>
          <select
            id="satuan"
            name="satuan"
            required
            defaultValue={initialData?.satuan ?? "BNB"}
            className={cn(
              "h-12 w-full rounded-[6px] border bg-surface px-4 text-sm text-ink outline-none transition-colors duration-150",
              "border-line-ui focus:border-brand-700 focus:ring-2 focus:ring-brand-100",
              state.errors?.satuan && "border-brand-500",
            )}
          >
            <option value="BNB">BNB</option>
            <option value="USDT">USDT</option>
          </select>
          {state.errors?.satuan ? (
            <p className="mt-1 text-xs text-brand-500">{state.errors.satuan}</p>
          ) : null}
        </div>
      </div>

      {/* Dana terkumpul + Donatur — satu baris */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="terkumpul" className="mb-1.5 block text-sm font-medium text-ink">
            Dana terkumpul
          </label>
          <input
            id="terkumpul"
            name="terkumpul"
            type="number"
            step="any"
            min="0"
            defaultValue={initialData?.terkumpul ?? 0}
            className={cn(
              "h-12 w-full rounded-[6px] border bg-surface px-4 font-mono text-sm tabular-nums text-ink outline-none transition-colors duration-150",
              "border-line-ui focus:border-brand-700 focus:ring-2 focus:ring-brand-100",
              state.errors?.terkumpul && "border-brand-500",
            )}
          />
          {state.errors?.terkumpul ? (
            <p className="mt-1 text-xs text-brand-500">{state.errors.terkumpul}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="donatur" className="mb-1.5 block text-sm font-medium text-ink">
            Jumlah donatur
          </label>
          <input
            id="donatur"
            name="donatur"
            type="number"
            min="0"
            defaultValue={initialData?.donatur ?? 0}
            className={cn(
              "h-12 w-full rounded-[6px] border bg-surface px-4 font-mono text-sm tabular-nums text-ink outline-none transition-colors duration-150",
              "border-line-ui focus:border-brand-700 focus:ring-2 focus:ring-brand-100",
              state.errors?.donatur && "border-brand-500",
            )}
          />
          {state.errors?.donatur ? (
            <p className="mt-1 text-xs text-brand-500">{state.errors.donatur}</p>
          ) : null}
        </div>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-ink">
          Status
        </label>
        <select
          id="status"
          name="status"
          required
          defaultValue={initialData?.status ?? "menunggu"}
          className={cn(
            "h-12 w-full rounded-[6px] border bg-surface px-4 text-sm text-ink outline-none transition-colors duration-150",
            "border-line-ui focus:border-brand-700 focus:ring-2 focus:ring-brand-100",
            state.errors?.status && "border-brand-500",
          )}
        >
          <option value="menunggu">Menunggu</option>
          <option value="aktif">Aktif</option>
          <option value="selesai">Selesai</option>
        </select>
        {state.errors?.status ? (
          <p className="mt-1 text-xs text-brand-500">{state.errors.status}</p>
        ) : null}
      </div>

      {/* Tombol aksi */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "inline-flex h-12 items-center justify-center rounded-[10px] px-6 text-sm font-medium text-white transition-colors duration-150",
            "bg-brand-700 hover:bg-brand-600 active:bg-brand-800",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
        >
          {pending ? "Menyimpan…" : submitLabel}
        </button>
        <Link
          href="/admin/kampanye"
          className="inline-flex h-12 items-center justify-center rounded-[10px] border border-brand-200 px-6 text-sm font-medium text-brand-700 transition-colors duration-150 hover:bg-brand-50 dark:border-brand-800 dark:text-brand-300 dark:hover:bg-brand-950"
        >
          Batal
        </Link>
      </div>
    </form>
  )
}
