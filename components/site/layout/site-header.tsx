"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, Wallet, X } from "lucide-react"

import { MizanWordmark } from "@/components/site/ui/mizan-mark"
import { mzBtn } from "@/components/site/ui/mz-button"
import { NAV } from "@/lib/site-data"

export function SiteHeader() {
  const [buka, setBuka] = React.useState(false)
  const panelId = "mz-nav-seluler"

  return (
    <header className="sticky top-0 z-50 border-b border-line-soft bg-canvas">
      <div className="mz-container flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <Link
          href="/"
          className="flex min-h-11 shrink-0 items-center text-base"
          aria-label="Mizan — kembali ke beranda"
        >
          <MizanWordmark />
        </Link>

        <nav className="hidden lg:block" aria-label="Navigasi utama">
          <ul className="flex items-center gap-1">
            {NAV.map((item: { href: string; label: string }) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-ink-body transition-colors duration-150 hover:bg-surface-sunken hover:text-ink"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#hubungkan"
            className={mzBtn("outline", "sm", "hidden sm:inline-flex")}
          >
            <Wallet className="size-4" strokeWidth={1.5} aria-hidden="true" />
            Hubungkan Dompet
          </a>

          <button
            type="button"
            onClick={() => setBuka((v) => !v)}
            className={mzBtn("ghost", "sm", "h-11 w-11 px-0 lg:hidden")}
            aria-expanded={buka}
            aria-controls={panelId}
            aria-label={buka ? "Tutup menu" : "Buka menu"}
          >
            {buka ? (
              <X className="size-5" strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <Menu className="size-5" strokeWidth={1.5} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {buka ? (
        <div id={panelId} className="border-t border-line-soft lg:hidden">
          <nav className="mz-container py-3" aria-label="Navigasi seluler">
            <ul className="flex flex-col">
              {NAV.map((item: { href: string; label: string }) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setBuka(false)}
                    className="block rounded-md px-3 py-3 text-[0.9375rem] font-medium text-ink-body transition-colors duration-150 hover:bg-surface-sunken hover:text-ink"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="#hubungkan"
              onClick={() => setBuka(false)}
              className={mzBtn("outline", "md", "mt-3 w-full sm:hidden")}
            >
              <Wallet className="size-4" strokeWidth={1.5} aria-hidden="true" />
              Hubungkan Dompet
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
