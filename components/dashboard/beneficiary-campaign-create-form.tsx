"use client"

import { useMemo, useState } from "react"
import { useActionState } from "react"
import { Plus, Trash2 } from "lucide-react"
import type { BeneficiaryCampaignFormState } from "@/app/(dashboard)/(beneficiary)/beneficiary/campaigns/actions"

type FormAction = (
  state: BeneficiaryCampaignFormState,
  formData: FormData,
) => Promise<BeneficiaryCampaignFormState>

type MilestoneDraft = { description: string; amount: string }

const initialState: BeneficiaryCampaignFormState = { success: false, message: "" }
const categories = [
  ["ZAKAT", "Zakat"],
  ["DONASI_UMUM", "Donasi Umum"],
  ["WAKAF", "Wakaf"],
  ["BENCANA", "Tanggap Bencana"],
] as const

const toWei = (value: string) => {
  const [whole, fraction = ""] = value.replace(",", ".").split(".")
  if (!/^\d+$/.test(whole) || !/^\d*$/.test(fraction) || fraction.length > 18) return "0"
  return (BigInt(whole) * BigInt("1000000000000000000") + BigInt(fraction.padEnd(18, "0") || "0")).toString()
}

export function BeneficiaryCampaignCreateForm({ action, walletAddress }: { action: FormAction; walletAddress: string }) {
  const [state, formAction, pending] = useActionState(action, initialState)
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([{ description: "", amount: "" }])
  const [target, setTarget] = useState("")
  const targetWei = useMemo(() => BigInt(toWei(target)), [target])
  const milestoneTotal = useMemo(
    () => milestones.reduce((total, milestone) => total + BigInt(toWei(milestone.amount)), BigInt(0)),
    [milestones],
  )
  const overTarget = targetWei > BigInt(0) && milestoneTotal > targetWei

  return (
    <form action={formAction} className="space-y-6 pb-24 sm:pb-0">
      <section className="mz-card space-y-5 p-5 sm:p-8">
        <div>
          <p className="mz-overline">Bagian 01</p>
          <h2 className="mt-2 text-h2 text-ink">Informasi dasar</h2>
          <p className="mt-2 text-sm text-ink-muted">Jelaskan kampanye dengan bahasa yang mudah dipahami calon donatur.</p>
        </div>
        <label className="block text-sm font-medium text-ink">Judul kampanye
          <input name="title" required className="mt-2 h-12 w-full rounded-[6px] border border-line-ui bg-surface px-4" placeholder="Contoh: Air Bersih untuk Warga Pesisir" />
        </label>
        <label className="block text-sm font-medium text-ink">Kategori
          <select name="category" required defaultValue="" className="mt-2 h-12 w-full rounded-[6px] border border-line-ui bg-surface px-4">
            <option value="" disabled>Pilih kategori</option>
            {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium text-ink">Deskripsi
          <textarea name="description" required rows={5} className="mt-2 w-full resize-y rounded-[6px] border border-line-ui bg-surface px-4 py-3" placeholder="Ceritakan kebutuhan, penerima manfaat, dan rencana penggunaan dana." />
        </label>
      </section>

      <section className="mz-card space-y-5 p-5 sm:p-8">
        <div>
          <p className="mz-overline">Bagian 02</p>
          <h2 className="mt-2 text-h2 text-ink">Target dana</h2>
        </div>
        <label className="block text-sm font-medium text-ink">Target dana
          <div className="mt-2 flex items-center rounded-[6px] border border-line-ui bg-surface focus-within:border-brand-700 focus-within:ring-2 focus-within:ring-brand-100">
            <input name="targetAmountWei" type="hidden" value={toWei(target)} />
            <input required inputMode="decimal" value={target} onChange={(event) => setTarget(event.target.value)} className="h-12 min-w-0 flex-1 border-0 bg-transparent px-4 font-mono outline-none" placeholder="0,00" />
            <span className="px-4 font-mono text-sm text-ink-muted">BNB</span>
          </div>
        </label>
        <label className="block text-sm font-medium text-ink">Alamat dompet penerima
          <input name="recipientWallet" defaultValue={walletAddress} required className="mt-2 h-12 w-full rounded-[6px] border border-line-ui bg-surface px-4 font-mono text-sm" />
          <span className="mt-2 block text-xs text-ink-muted">Gunakan alamat EVM yang menerima dana kampanye.</span>
        </label>
      </section>

      <section className="mz-card space-y-5 p-5 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div><p className="mz-overline">Bagian 03</p><h2 className="mt-2 text-h2 text-ink">Milestone penyaluran</h2></div>
          <span className="mz-num text-sm text-ink-muted">{milestones.length} tahap</span>
        </div>
        <div className="space-y-4">
          {milestones.map((milestone, index) => (
            <div key={index} className="rounded-[10px] border border-line-soft bg-very-light-purple p-4">
              <div className="mb-3 flex items-center justify-between"><span className="text-sm font-semibold text-ink">Tahap {index + 1}</span>{milestones.length > 1 && <button type="button" onClick={() => setMilestones((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[6px] text-coral" aria-label={`Hapus tahap ${index + 1}`}><Trash2 size={18} strokeWidth={1.5} /></button>}</div>
              <input value={milestone.description} onChange={(event) => setMilestones((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item))} className="h-12 w-full rounded-[6px] border border-line-ui bg-surface px-4" placeholder="Deskripsi tahap penyaluran" />
              <div className="mt-3 flex items-center rounded-[6px] border border-line-ui bg-surface"><input value={milestone.amount} onChange={(event) => setMilestones((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, amount: event.target.value } : item))} className="h-12 min-w-0 flex-1 bg-transparent px-4 font-mono outline-none" placeholder="Nominal" inputMode="decimal" /><span className="px-4 font-mono text-sm text-ink-muted">BNB</span></div>
              <input type="hidden" name="milestones" value={JSON.stringify({ description: milestone.description, amountWei: toWei(milestone.amount) })} readOnly />
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setMilestones((current) => [...current, { description: "", amount: "" }])} className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-brand-200 px-4 text-sm font-medium text-brand-700"><Plus size={18} strokeWidth={1.5} />Tambah milestone</button>
        <div className={overTarget ? "rounded-[10px] border border-coral/40 bg-coral/10 p-4 text-sm text-coral" : "rounded-[10px] border border-line-soft bg-very-light-purple p-4 text-sm text-ink-muted"} role="status">
          Total milestone: <span className="mz-num font-semibold">{(Number(milestoneTotal) / 1e18).toLocaleString("id-ID", { maximumFractionDigits: 4 })} BNB</span>{overTarget ? " — melebihi target dana." : ""}
        </div>
      </section>

      {state.message ? <p className="rounded-[10px] border border-coral/40 bg-coral/10 p-4 text-sm text-coral" role="alert">{state.message}</p> : null}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line-soft bg-surface/95 p-4 sm:static sm:border-0 sm:bg-transparent sm:p-0"><button type="submit" disabled={pending || overTarget} className="flex h-12 w-full items-center justify-center rounded-[10px] bg-brand-700 px-6 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">{pending ? "Mengajukan…" : "Ajukan Kampanye"}</button></div>
      <p className="text-xs text-ink-muted">Data testnet — dana tidak nyata. Kampanye akan ditinjau Admin sebelum tampil ke publik.</p>
    </form>
  )
}
