"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/src/lib/utils"
import { useWallets } from "@privy-io/react-auth"
import { MizanWordmark } from "@/components/site/ui/mizan-mark"
import type { NavItem } from "@/src/lib/dashboard-data"
import {
  LayoutDashboard,
  Megaphone,
  ArrowUpRight,
  Users,
  Settings,
  History,
  Search,
  ArrowDownLeft,
  Copy,
  Check,
  X,
  Menu,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  Megaphone,
  ArrowUpRight,
  Users,
  Settings,
  History,
  Search,
  ArrowDownLeft,
}

type SidebarProps = {
  navItems: NavItem[]
  role: string
  walletShort: string
  walletFull: string
  children: React.ReactNode
}

/**
 * Shell dashboard: sidebar (desktop) + topbar (mobile) + area konten.
 *
 * DESIGN.md kepatuhan:
 * §4  — Latar sidebar: --surface. Batas kanan: --line-soft.
 * §5  — Label: Plus Jakarta Sans. Alamat dompet: mono.
 * §6  — Skala jarak: 4·8·12·16·24·32·48·64. Padding kelipatan 8.
 * §7  — Radius: --radius-sm (6px) untuk item navigasi.
 * §8  — Ikon: lucide-react, strokeWidth 1.5, size 20px dalam teks.
 * §9  — Transisi warna hover: 150ms. Nol animasi lain.
 * §10 — Badge notifikasi: --brand-50 + teks --brand-700.
 * §10 — Chip testnet: --accent-200 + teks --ink.
 * §13 — Sasaran sentuh minimal 44×44px. Fokus terlihat.
 */
export function DashboardShell({
  navItems,
  role,
  walletShort,
  walletFull,
  children,
}: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const { wallets } = useWallets()
  const connectedWallet = wallets.find((wallet) => wallet.type === "ethereum")
  const liveWalletFull = connectedWallet?.address ?? walletFull
  const liveWalletShort = connectedWallet
    ? `${connectedWallet.address.slice(0, 6)}…${connectedWallet.address.slice(-4)}`
    : walletShort

  function handleCopy() {
    navigator.clipboard.writeText(liveWalletFull)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const sidebarContent = (
    <>
      {/* Wordmark */}
      <div className="flex h-16 items-center px-6 lg:h-[72px]">
        <Link
          href="/"
          className="flex min-h-11 shrink-0 items-center"
          aria-label="Mizan — kembali ke beranda"
        >
          <MizanWordmark />
        </Link>
      </div>

      {/* Role chip + testnet */}
      <div className="flex items-center gap-2 px-6 pb-4">
        <span className="inline-flex h-7 items-center rounded-full bg-brand-50 px-3 text-[0.8125rem] font-semibold uppercase leading-[1.4] tracking-[0.02em] text-brand-700 dark:bg-brand-950 dark:text-brand-300">
          {role}
        </span>
        <span className="inline-flex h-7 items-center rounded-full bg-accent-200 px-3 text-[0.8125rem] font-semibold leading-[1.4] tracking-[0.02em] text-ink dark:bg-accent-200/20 dark:text-accent-text">
          Testnet
        </span>
      </div>

      {/* Navigasi */}
      <nav className="flex-1 px-3" aria-label={`Navigasi ${role}`}>
        <ul className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const Icon = ICON_MAP[item.icon]
            const isActive = pathname === item.href

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-150",
                    isActive
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"
                      : "text-ink-body hover:bg-surface-sunken hover:text-ink",
                  )}
                >
                  {Icon ? (
                    <Icon
                      className="size-5 shrink-0"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  ) : null}
                  <span className="flex-1">{item.label}</span>
                  {item.badge != null && item.badge > 0 ? (
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-50 px-1.5 font-mono text-xs font-semibold tabular-nums text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Dompet */}
      <div className="border-t border-line-soft p-4">
        <p className="mb-1 text-xs text-ink-muted">Dompet terhubung</p>
        <div className="flex items-center gap-2">
          <span className="flex-1 truncate font-mono text-sm text-ink">
            {liveWalletShort}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex size-8 items-center justify-center rounded-md text-ink-muted transition-colors duration-150 hover:bg-surface-sunken hover:text-ink"
            aria-label="Salin alamat dompet"
          >
            {copied ? (
              <Check className="size-4" strokeWidth={1.5} aria-hidden="true" />
            ) : (
              <Copy className="size-4" strokeWidth={1.5} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </>
  )

  return (
    <div className="flex min-h-dvh">
      {/* Sidebar — desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line-soft bg-surface lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Scrim */}
          <div
            className="absolute inset-0 bg-ink/20"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside className="relative flex h-full w-64 flex-col bg-surface shadow-lg">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-md text-ink-muted hover:bg-surface-sunken hover:text-ink"
              aria-label="Tutup menu"
            >
              <X className="size-5" strokeWidth={1.5} aria-hidden="true" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      ) : null}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar — mobile */}
        <header className="flex h-16 items-center gap-4 border-b border-line-soft bg-surface px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex size-11 items-center justify-center rounded-md text-ink-muted hover:bg-surface-sunken hover:text-ink"
            aria-label="Buka menu"
          >
            <Menu className="size-5" strokeWidth={1.5} aria-hidden="true" />
          </button>
          <Link
            href="/"
            className="flex min-h-11 shrink-0 items-center"
            aria-label="Mizan — kembali ke beranda"
          >
            <MizanWordmark />
          </Link>
        </header>

        {/* Konten halaman */}
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
