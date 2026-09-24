"use client"

import { useActionState } from "react"
import { Loader2, Banknote } from "lucide-react"
import { requestMilestoneDisbursement } from "../milestones/actions"

type DisbursementResult = { success: boolean; message: string } | null

export function DisbursementActions({
  milestoneId,
  campaignId,
}: {
  milestoneId: string
  campaignId: string
}) {
  const action = async (_prev: DisbursementResult) => {
    return requestMilestoneDisbursement(milestoneId)
  }

  const [state, formAction, isPending] = useActionState(action, null)

  if (state?.success) {
    return (
      <span className="inline-flex h-7 items-center rounded-full bg-accent-200/20 px-3 text-[0.8125rem] font-semibold uppercase tracking-[0.02em] text-ink">
        Menunggu Pencairan
      </span>
    )
  }

  return (
    <div>
      <form action={formAction}>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-11 items-center gap-2 rounded-[10px] bg-brand-700 px-4 text-sm font-medium text-white transition-colors hover:bg-brand-800 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 size={16} strokeWidth={1.5} className="animate-spin" />
              Memproses…
            </>
          ) : (
            <>
              <Banknote size={16} strokeWidth={1.5} />
              Ajukan Pencairan
            </>
          )}
        </button>
      </form>
      {state && !state.success && (
        <p className="mt-2 text-xs text-coral">{state.message}</p>
      )}
    </div>
  )
}
