import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import {
  DASHBOARD_SESSION_COOKIE,
  readDashboardSession,
} from "@/src/lib/auth-session"
import { getExplorePath } from "@/src/lib/role-dashboard"

export const metadata: Metadata = {
  title: "Jelajahi Kampanye — Mizan",
}

export default async function ExplorePage() {
  const cookieStore = await cookies()
  const session = await readDashboardSession(
    cookieStore.get(DASHBOARD_SESSION_COOKIE)?.value,
  )

  redirect(getExplorePath(session?.role))
}
