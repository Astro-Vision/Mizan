"use client"

import * as React from "react"
import { useActionState } from "react"
import Link from "next/link"
import { cn } from "@/src/lib/utils"
import type { CampaignReview } from "@/src/lib/dashboard-data"
import type { CampaignFormState } from "@/src/lib/campaign-workflow"

type CampaignFormProps = {
  action: (state: CampaignFormState, formData: FormData) => Promise<CampaignFormState>
  initialData?: CampaignReview | null
  submitLabel?: string
}

const INITIAL_STATE: CampaignFormState = { success: false, message: "" }

export function CampaignForm({
  action,
  initialData,
  submitLabel = "Simpan",
}: CampaignFormProps) {
  const [state, formAction, pending] = useActionState(action, INITIAL_STATE)

  return (
    <form action={formAction} className="space-y-6">
      {state.message && !state.success ? (
        <div className="rounded-[6px] border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-300">
          {state.message}
        </div>
      ) : null}

      <p className="rounded-xl border border-line-soft bg-surface-sunken px-4 py-3 text-sm text-ink-muted">
        Draft kampanye dibuat oleh AI mock, lalu harus ditinjau admin sebelum aktif.
      </p>

      <Field
        id="judul"
        label="Judul kampanye"
        defaultValue={initialData?.title ?? initialData?.judul ?? ""}
        placeholder="Contoh: Bantuan pendidikan untuk 40 anak yatim"
        error={state.errors?.title ?? state.errors?.judul}
      />
      <Field
        id="penyelenggara"
        label="Penyelenggara"
        defaultValue={initialData?.organizerName ?? initialData?.penyelenggara ?? ""}
        placeholder="Contoh: Yayasan Nurul Iman"
        error={state.errors?.organizerName ?? state.errors?.penyelenggara}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          id="target"
          label="Target dana (BNB)"
          type="number"
          step="0.000000000000000001"
          min="0.000000000000000001"
          defaultValue={initialData?.target ?? ""}
          placeholder="0.00"
          error={state.errors?.target}
          inputClassName="font-mono tabular-nums"
        />
        <Field
          id="recipientWallet"
          label="Wallet komunitas"
          defaultValue={initialData?.recipientWallet ?? ""}
          placeholder="0x..."
          error={state.errors?.recipientWallet}
          inputClassName="font-mono text-xs"
        />
      </div>

      <Field
        id="aiReference"
        label="Source / reference AI"
        defaultValue={initialData?.aiReference ?? ""}
        placeholder="URL, ID laporan, atau referensi sumber"
        error={state.errors?.aiReference}
      />

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className={cn(
            "inline-flex h-12 items-center justify-center rounded-[10px] px-6 text-sm font-medium text-white transition-colors duration-150",
            "bg-brand-700 hover:bg-brand-600 active:bg-brand-800 disabled:pointer-events-none disabled:opacity-50",
          )}
        >
          {pending ? "Menyimpan…" : submitLabel}
        </button>
        <Link
          href="/admin/campaigns"
          className="inline-flex h-12 items-center justify-center rounded-[10px] border border-brand-200 px-6 text-sm font-medium text-brand-700 transition-colors duration-150 hover:bg-brand-50 dark:border-brand-800 dark:text-brand-300 dark:hover:bg-brand-950"
        >
          Batal
        </Link>
      </div>
    </form>
  )
}

function Field({
  id,
  label,
  defaultValue,
  placeholder,
  error,
  type = "text",
  step,
  min,
  inputClassName,
}: {
  id: string
  label: string
  defaultValue: string | number
  placeholder: string
  error?: string
  type?: string
  step?: string
  min?: string
  inputClassName?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        step={step}
        min={min}
        required
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={cn(
          "h-12 w-full rounded-[6px] border bg-surface px-4 text-sm text-ink outline-none transition-colors duration-150",
          "border-line-ui focus:border-brand-700 focus:ring-2 focus:ring-brand-100 placeholder:text-ink-muted",
          inputClassName,
          error && "border-brand-500",
        )}
      />
      {error ? <p className="mt-1 text-xs text-brand-500">{error}</p> : null}
    </div>
  )
}
