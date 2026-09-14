import { SectionHead } from "@/components/site/ui/section-head"
import { FAQ } from "@/lib/site-data"

/**
 * Tanya jawab — dua kolom, semua jawaban terbuka.
 *
 * Bukan akordeon. Akordeon di bagian bawah halaman adalah pola yang dipakai
 * hampir semua situs buatan generator: menyembunyikan jawaban demi menghemat
 * ruang, padahal jawabannya justru yang meyakinkan orang.
 */

export function Faq() {
  return (
    <section id="tanya-jawab" className="mz-section bg-surface-sunken">
      <div className="mz-container">
        <SectionHead
          overline="Tanya jawab"
          title="Keberatan yang biasanya muncul"
          desc="Termasuk yang paling tidak nyaman: soal uangnya belum nyata."
        />

        <dl className="mt-12 grid grid-cols-1 gap-x-10 gap-y-9 lg:grid-cols-2">
          {FAQ.map((item: { q: string; a: string }) => (
            <div
              key={item.q}
              className="border-t border-line-soft pt-6"
            >
              <dt className="text-h3 text-balance text-ink">{item.q}</dt>
              <dd className="mt-3 mz-prose text-sm text-ink-body">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
