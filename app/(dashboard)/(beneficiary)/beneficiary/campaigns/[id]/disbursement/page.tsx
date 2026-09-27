import Link from "next/link"
import { ChevronLeft, ArrowUpRight } from "lucide-react"
import { notFound } from "next/navigation"
import { getMilestones } from "../milestones/actions"

const EXPLORER_URL = "https://testnet.bscscan.com"

export default async function DisbursementPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getMilestones(id)
  if (!result) notFound()

  const eligible = result.milestones.filter((m) =>
    ["AI_VERIFIED", "DISBURSEMENT_REQUESTED", "DISBURSED"].includes(m.status),
  )

  const totalDisbursedWei = result.milestones
    .filter((m) => m.status === "DISBURSED")
    .reduce((sum, m) => sum + BigInt(m.amountWei || "0"), BigInt(0))

  const totalEligibleWei = eligible.reduce(
    (sum, m) => sum + BigInt(m.amountWei || "0"),
    BigInt(0),
  )

  return (
    <div className="mx-auto max-w-[840px]">
      <Link
        href={`/beneficiary/campaigns/${id}`}
        className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ChevronLeft size={18} strokeWidth={1.5} />
        Kembali ke kampanye
      </Link>

      <p className="mz-overline">Penyaluran</p>
      <h1 className="mt-2 text-h1 text-ink">Ajukan pencairan</h1>
      <p className="mt-3 max-w-2xl text-sm text-ink-muted">
        Milestone yang sudah terverifikasi AI dapat diajukan untuk pencairan
        dana.
      </p>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-[10px] border border-line-soft bg-surface p-4">
          <p className="text-xs text-ink-muted">Total eligible</p>
          <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-ink">
            {formatWei(totalEligibleWei.toString())}{" "}
            <span className="text-sm font-normal text-ink-muted">
              {result.campaign.currency}
            </span>
          </p>
        </div>
        <div className="rounded-[10px] border border-line-soft bg-surface p-4">
          <p className="text-xs text-ink-muted">Sudah dicairkan</p>
          <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-brand-700">
            {formatWei(totalDisbursedWei.toString())}{" "}
            <span className="text-sm font-normal text-ink-muted">
              {result.campaign.currency}
            </span>
          </p>
        </div>
      </div>

      {/* Milestone list */}
      <div className="mt-8 space-y-3">
        {eligible.map((milestone) => (
          <div
            key={milestone.id}
            className="mz-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-50 font-mono text-xs text-brand-700">
                  {milestone.order}
                </span>
                <h2 className="font-semibold text-ink">
                  {milestone.description}
                </h2>
              </div>
              <p className="mt-1 font-mono text-sm text-ink-muted">
                {formatWei(milestone.amountWei)} {result.campaign.currency}
              </p>

              {/* Disbursement timestamp */}
              {milestone.disbursementRequestedAt && (
                <p className="mt-2 text-xs text-ink-muted">
                  Diajukan:{" "}
                  {new Date(
                    milestone.disbursementRequestedAt,
                  ).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              )}

              {/* TX hash link */}
              {milestone.disbursementTxHash && (
                <a
                  href={`${EXPLORER_URL}/tx/${milestone.disbursementTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1 font-mono text-xs text-brand-700 hover:underline"
                >
                  {milestone.disbursementTxHash.slice(0, 10)}…
                  {milestone.disbursementTxHash.slice(-6)}
                  <ArrowUpRight size={12} strokeWidth={1.5} />
                </a>
              )}
            </div>

            <div className="shrink-0">
              {milestone.status === "AI_VERIFIED" ? (
                <span className="inline-flex h-7 items-center rounded-full bg-accent-200/20 px-3 text-[0.8125rem] font-semibold uppercase tracking-[0.02em] text-ink">
                  Menunggu persetujuan admin
                </span>
              ) : (
                <span
                  className={`inline-flex h-7 items-center rounded-full px-3 text-[0.8125rem] font-semibold uppercase tracking-[0.02em] ${
                    milestone.status === "DISBURSED"
                      ? "bg-brand-50 text-brand-700"
                      : "bg-accent-200/20 text-ink"
                  }`}
                >
                  {milestone.status === "DISBURSED"
                    ? "Dana Cair"
                    : "Menunggu Pencairan"}
                </span>
              )}
            </div>
          </div>
        ))}

        {eligible.length === 0 && (
          <div className="mz-card p-8 text-center text-sm text-ink-muted">
            Belum ada milestone yang siap diajukan. Verifikasi bukti penyaluran
            melalui halaman milestone terlebih dahulu.
          </div>
        )}
      </div>
    </div>
  )
}

function formatWei(value: string) {
  const big = BigInt(value || "0")
  const whole = big / BigInt("1000000000000000000")
  const fraction = (big % BigInt("1000000000000000000"))
    .toString()
    .padStart(18, "0")
    .slice(0, 4)
    .replace(/0+$/, "")
  return `${whole}${fraction ? `.${fraction}` : ""}`
}
