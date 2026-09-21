import { NextResponse, type NextRequest } from "next/server"

import {
  DASHBOARD_SESSION_COOKIE,
  readDashboardSession,
} from "./src/lib/auth-session"
import { getRoleDashboardPath } from "./src/lib/role-dashboard"

const requiredRoleByPrefix = [
  ["/admin", "ADMIN"],
  ["/donatur", "BENEFACTOR"],
  ["/penerima", "BENEFACTORY"],
] as const

const redirectToHome = (request: NextRequest) => {
  const url = request.nextUrl.clone()
  url.pathname = "/"
  url.searchParams.set("next", request.nextUrl.pathname)
  return NextResponse.redirect(url)
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = await readDashboardSession(
    request.cookies.get(DASHBOARD_SESSION_COOKIE)?.value
  )
  const dashboardPath = session ? getRoleDashboardPath(session.role) : null

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (!dashboardPath) {
      return redirectToHome(request)
    }

    const url = request.nextUrl.clone()
    url.pathname = dashboardPath
    url.search = ""
    return NextResponse.redirect(url)
  }

  const requiredRole = requiredRoleByPrefix.find(([prefix]) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  )?.[1]

  if (!requiredRole) {
    return NextResponse.next()
  }

  if (!session || !dashboardPath) {
    return redirectToHome(request)
  }

  if (session.role !== requiredRole) {
    const url = request.nextUrl.clone()
    url.pathname = dashboardPath
    url.search = ""
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/donatur/:path*",
    "/penerima/:path*",
    "/dashboard/:path*",
  ],
}
