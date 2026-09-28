import { ExternalLink, FileCheck2 } from "lucide-react"

import type { PublicDisbursementHistoryItem } from "@/src/lib/campaigns-server"

export function DisbursementHistory({ items, title = "Histori penggunaan dana" }: { items: PublicDisbursementHistoryItem[]; title?: string }) {
  return (
    <section className="mt-12">
      <p className="mz-overline">Transparansi</p>
      <h2 className="mt-3 text-h2 text-ink">{title}</h2>
      {items.length === 0 ? <div className="mt-6 rounded-2xl border border-line-soft bg-surface p-6 text-sm text-ink-muted">Belum ada histori pencairan yang dipublikasikan.</div> : <div className="mt-6 space-y-4">{items.map((item) => <article key={item.id} className="rounded-2xl border border-line-soft bg-surface p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex items-center gap-2"><FileCheck2 className="size-4 text-brand-violet" /><h3 className="font-semibold text-ink">{item.milestone}</h3></div><p className="mt-2 text-sm leading-6 text-ink-muted">{item.description}</p></div><div className="shrink-0 text-left sm:text-right"><p className="font-mono text-sm font-semibold text-ink">{formatWei(item.amountWei)} {item.currency}</p><p className="mt-1 text-xs text-ink-muted">{new Date(item.createdAt).toLocaleDateString("id-ID")} · {item.region}</p></div></div><div className="mt-4 flex flex-wrap gap-2">{item.items.map((detail) => <span key={`${detail.name}-${detail.unit}`} className="rounded-full bg-soft-lavender px-3 py-1 text-xs text-ink">{detail.name} · {detail.quantity} {detail.unit}</span>)}</div>{item.documentUrl ? <a href={item.documentUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary-purple hover:underline">Lihat dokumen <ExternalLink className="size-3.5" /></a> : null}</article>)}</div>}
    </section>
  )
}

function formatWei(value: string) {
  const big = BigInt(value || "0")
  const whole = big / BigInt("1000000000000000000")
  const fraction = (big % BigInt("1000000000000000000")).toString().padStart(18, "0").slice(0, 4).replace(/0+$/, "")
  return `${whole}${fraction ? `.${fraction}` : ""}`
}
