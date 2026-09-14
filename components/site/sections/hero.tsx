import { ArrowRight, Lock, ShieldCheck, Wallet } from "lucide-react"

import { Neraca } from "@/components/site/ui/neraca"
import { mzBtn } from "@/components/site/ui/mz-button"
import { STATS } from "@/lib/site-data"

/**
 * Hero — tata letak asimetris (6/6), bukan tengah.
 * Visualnya Neraca: gerakannya punya alasan, bukan hiasan.
 * Lihat DESIGN.md §12.2.
 */

export function Hero() {
  const masuk = 37.35
  const keluar = 31.1

  return (
    <section className="mz-section pt-12 sm:pt-16 lg:pt-20">
      <div className="mz-container grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6 lg:pr-8">
          <p className="mz-overline">Zakat &amp; donasi on-chain</p>

          <h1 className="mt-4 text-display text-balance text-ink">
            Setiap dana punya jejaknya.
          </h1>

          <p className="mt-6 mz-prose text-body-lg text-ink-body">
            Donasi masuk ke kontrak pintar di BNB Smart Chain, bukan ke rekening
            kami. Setiap pencairan ke penerima tercatat di blockchain dan bisa
            kamu periksa sendiri — kapan saja, tanpa perlu izin siapa pun.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            {/* Satu-satunya tombol accent di halaman */}
            <a href="#kampanye" className={mzBtn("accent", "lg")}>
              Donasi Sekarang
              <ArrowRight
                className="size-5"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </a>
            <a href="#alur-dana" className={mzBtn("outline", "lg")}>
              Lihat Alur Dana
            </a>
          </div>

          <ul className="mt-9 flex flex-wrap gap-x-7 gap-y-2.5">
            {[
              { icon: ShieldCheck, text: "Data uji testnet" },
              { icon: Lock, text: "Dana ditahan kontrak" },
              { icon: Wallet, text: "Tanpa perantara" },
            ].map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-2 mz-num text-xs text-ink-muted"
              >
                <Icon
                  className="size-4 shrink-0"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-6">
          <Neraca masuk={masuk} keluar={keluar} satuan="BNB" />
          <p className="mt-4 text-center mz-num text-xs text-ink-muted">
            {STATS[0].value} transaksi tercatat di BNB Smart Chain Testnet
          </p>
        </div>
      </div>
    </section>
  )
}
