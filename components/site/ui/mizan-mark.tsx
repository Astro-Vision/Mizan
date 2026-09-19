/**
 * Lambang Mizan — neraca/timbangan.
 * `mizan` berarti neraca. Lambangnya menggambarkan fungsi produknya,
 * bukan hiasan: menakar dan menyeimbangkan amanah.
 */

import { cn } from "@/src/lib/utils"

export function MizanMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <g
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* tiang */}
        <path d="M12 5.5v12.5" />
        {/* balok */}
        <path d="M5 7.5h14" />
        {/* rantai */}
        <path d="M5 7.5v3.8" />
        <path d="M19 7.5v3.8" />
        {/* piringan */}
        <path d="M2.6 11.3q2.4 3.1 4.8 0" />
        <path d="M16.6 11.3q2.4 3.1 4.8 0" />
        {/* dasar */}
        <path d="M8.6 18h6.8" />
      </g>
    </svg>
  )
}

/** Kunci wordmark: lambang + nama. Satu-satunya penempatan lambang di halaman. */
export function MizanWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <MizanMark className="size-[1.45em] text-brand-700 dark:text-brand-400" />
      <span className="text-[1.15em] font-extrabold tracking-[-0.03em] text-ink">
        Mizan
      </span>
    </span>
  )
}
