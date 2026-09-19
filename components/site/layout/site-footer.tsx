import { ExternalLink } from "lucide-react"

import { MizanMark } from "@/components/site/ui/mizan-mark"
import { NAV, SITE, TESTNET_NOTICE } from "@/src/lib/site-data"

const SUMBER: { label: string; href: string; external?: boolean }[] = [
  { label: "Kontrak di BscScan", href: `${SITE.explorer}/address/${SITE.contract}`, external: true },
  { label: "Dokumentasi kontrak", href: "#alur-dana" },
  { label: "Tanya jawab", href: "#tanya-jawab" },
]

export function SiteFooter() {
  const tahun = new Date().getFullYear()

  return (
    <footer className="bg-brand-700 text-brand-100">
      <div className="mz-container py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <span className="inline-flex items-center gap-2 text-base">
              <MizanMark className="size-[1.45em] text-white" />
              <span className="text-[1.15em] font-extrabold tracking-[-0.03em] text-white">
                Mizan
              </span>
            </span>
            <p className="mt-5 max-w-[42ch] text-sm text-brand-100">
              Platform zakat dan donasi yang menaruh dana di kontrak pintar,
              bukan di rekening pengelola. Setiap pencairan tercatat dan bisa
              diperiksa siapa pun.
            </p>
          </div>

          <nav className="lg:col-span-3" aria-label="Navigasi footer">
            <h2 className="text-label uppercase tracking-[0.08em] text-brand-200">
              Halaman
            </h2>
            <ul className="mt-4 flex flex-col">
              {NAV.map((item: { href: string; label: string }) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="flex min-h-11 items-center text-sm text-white transition-colors duration-150 hover:text-brand-200"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-4">
            <h2 className="text-label uppercase tracking-[0.08em] text-brand-200">
              Sumber
            </h2>
            <ul className="mt-4 flex flex-col">
              {SUMBER.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    {...(item.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="flex min-h-11 items-center gap-1.5 text-sm text-white transition-colors duration-150 hover:text-brand-200"
                  >
                    {item.label}
                    {item.external ? (
                      <ExternalLink
                        className="size-3.5"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                    ) : null}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 rounded-lg border border-white/25 p-6">
          <h2 className="text-label uppercase tracking-[0.08em] text-brand-200">
            Status proyek
          </h2>
          <p className="mt-4 max-w-[75ch] text-sm text-white">
            {TESTNET_NOTICE} Mizan masih berupa purwarupa dan belum berizin
            sebagai lembaga amil zakat. Kontraknya belum diaudit pihak ketiga.
            Karena itu kami tidak mengumpulkan dana nyata dalam bentuk apa pun
            sampai kedua hal itu selesai.
          </p>
          <p className="mt-4 mz-num text-xs text-brand-200">
            Jaringan: {SITE.network} · Chain ID {SITE.chainId} · Kontrak{" "}
            {SITE.contractShort}
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/25 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="mz-num text-xs text-brand-200">© {tahun} Mizan</p>
          <p className="mz-num text-xs text-brand-200">
            Tidak ada dana nyata yang dikumpulkan di halaman ini
          </p>
        </div>
      </div>
    </footer>
  )
}
