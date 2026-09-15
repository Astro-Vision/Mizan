import { DashboardShell } from "@/components/dashboard/sidebar"
import { ADMIN_NAV } from "@/lib/dashboard-data"
import { SITE } from "@/lib/site-data"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardShell
      navItems={ADMIN_NAV}
      role="Admin"
      walletShort={SITE.contractShort}
      walletFull={SITE.contract}
    >
      {children}
    </DashboardShell>
  )
}
