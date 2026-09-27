import Link from "next/link"
import { ChevronLeft, Copy } from "lucide-react"
import { requireBeneficiaryCommunity } from "@/src/lib/beneficiary/access"
import { db } from "@/src/prisma/db"
import { TeamMembersSection, type MemberData } from "@/components/community/team-members-section"

const shorten = (value: string) =>
  value.length > 14 ? `${value.slice(0, 8)}…${value.slice(-6)}` : value

export default async function BeneficiaryProfilePage() {
  const { community, memberRole } = await requireBeneficiaryCommunity()

  const status =
    community.verificationStatus === "VERIFIED"
      ? "Terverifikasi"
      : community.verificationStatus === "REJECTED"
      ? "Ditolak"
      : "Menunggu Verifikasi"

  // Fetch all community members and user info
  const dbMembers = await db.orm.public.CommunityMember.where({
    communityId: community.id,
  }).all()

  const initialMembers: MemberData[] = await Promise.all(
    dbMembers.map(async (m) => {
      const user = await db.orm.public.User.where({ id: m.userId }).first()
      return {
        id: m.id,
        userId: m.userId,
        role: m.role as "OWNER" | "STAFF",
        status: m.status as "PENDING" | "ACTIVE" | "REJECTED",
        user: {
          id: m.userId,
          name: user?.name ?? null,
          email: user?.email ?? null,
          username: user?.username ?? null,
        },
      }
    })
  )

  return (
    <div className="mx-auto max-w-[840px]">
      <Link
        href="/beneficiary"
        className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-ink-muted"
      >
        <ChevronLeft size={18} strokeWidth={1.5} />
        Kembali ke ringkasan
      </Link>
      <p className="mz-overline">Organisasi</p>
      <h1 className="mt-2 text-h1 text-ink">Profil organisasi</h1>
      <p className="mt-3 max-w-2xl text-sm text-ink-muted">
        Informasi organisasi yang digunakan saat kampanye ditinjau dan dana disalurkan.
      </p>

      {/* Detail Organisasi */}
      <section className="mz-card mt-8 p-5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-h2 text-ink">{community.name}</h2>
            <p className="mt-2 text-sm text-ink-muted">Community ID {community.id}</p>
          </div>
          <span className="inline-flex h-7 items-center rounded-full bg-warm-yellow px-3 text-[0.8125rem] font-semibold uppercase tracking-[0.02em] text-ink">
            {status}
          </span>
        </div>

        <div className="mt-8 border-t border-line-soft pt-6">
          <p className="text-sm font-medium text-ink">Dompet penerima</p>
          <div className="mt-2 flex items-center justify-between gap-3 rounded-[10px] bg-brand-950 p-4 text-brand-100">
            <span className="font-mono text-sm">{shorten(community.walletAddress)}</span>
            <span className="flex items-center gap-3 text-xs">
              <span className="rounded-full bg-warm-yellow px-2 py-1 font-semibold text-ink">
                BSC Testnet
              </span>
              <Copy size={18} strokeWidth={1.5} aria-label="Salin alamat dompet" />
            </span>
          </div>
          <a
            href={`https://testnet.bscscan.com/address/${community.walletAddress}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex min-h-11 items-center text-sm text-brand-700 underline-offset-2 hover:underline"
          >
            Lihat dompet di BscScan ↗
          </a>
        </div>
      </section>

      {/* Legalitas */}
      <section className="mz-card mt-6 p-5 sm:p-8">
        <h2 className="text-h2 text-ink">Legalitas</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Status verifikasi legalitas dikelola oleh Admin Mizan. Perubahan data akan ditinjau kembali sebelum status berubah.
        </p>
        <label className="mt-6 block text-sm font-medium text-ink">
          Nomor registrasi
          <input
            className="mt-2 h-12 w-full rounded-[6px] border border-line-ui bg-surface px-4 text-sm"
            placeholder="Masukkan nomor registrasi"
            defaultValue={community.registrationNumber || ""}
          />
        </label>
        <label className="mt-5 block text-sm font-medium text-ink">
          Dokumen legalitas
          <input
            type="file"
            accept="application/pdf,image/*"
            className="mt-2 block min-h-12 w-full rounded-[6px] border border-line-ui bg-surface px-3 py-3 text-sm"
          />
        </label>
        <button
          type="button"
          className="mt-6 min-h-11 rounded-[10px] bg-brand-700 px-5 text-sm font-medium text-white"
        >
          Ajukan perubahan profil
        </button>
      </section>

      {/* Section Anggota Tim */}
      <TeamMembersSection
        initialMembers={initialMembers}
        currentUserRole={memberRole}
        inviteCode={community.inviteCode}
      />

      <p className="mt-6 text-xs text-ink-muted">Data testnet — dana tidak nyata.</p>
    </div>
  )
}
