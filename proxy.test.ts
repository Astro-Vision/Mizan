import { NextRequest } from "next/server"
import { beforeEach, describe, expect, it } from "vitest"

import { createDashboardSession, DASHBOARD_SESSION_COOKIE } from "./src/lib/auth-session"
import { proxy } from "./proxy"

const requestFor = (path: string, session?: string) =>
  new NextRequest(`https://mizan.test${path}`, {
    headers: session
      ? { cookie: `${DASHBOARD_SESSION_COOKIE}=${session}` }
      : undefined,
  })

describe("dashboard proxy", () => {
  beforeEach(() => {
    process.env.PRIVY_APP_SECRET = "test-session-secret"
  })

  it("allows a role to access its own dashboard", async () => {
    const session = await createDashboardSession({
      privyId: "did:privy:donor",
      role: "BENEFACTOR",
      userType: "DONOR",
    })

    const response = await proxy(requestFor("/donatur", session))

    expect(response.headers.get("x-middleware-next")).toBe("1")
  })

  it("sends a role that opens another dashboard back to its own dashboard", async () => {
    const session = await createDashboardSession({
      privyId: "did:privy:donor",
      role: "BENEFACTOR",
      userType: "DONOR",
    })

    const response = await proxy(requestFor("/admin", session))

    expect(response.headers.get("location")).toBe("https://mizan.test/donatur")
  })

  it("sends an unauthenticated dashboard request to the public landing page", async () => {
    const response = await proxy(requestFor("/penerima/kampanye"))

    expect(response.headers.get("location")).toBe(
      "https://mizan.test/?next=%2Fpenerima%2Fkampanye"
    )
  })

  it("resolves the dashboard shortcut from the authenticated role", async () => {
    const session = await createDashboardSession({
      privyId: "did:privy:admin",
      role: "ADMIN",
      userType: null,
    })

    const response = await proxy(requestFor("/dashboard", session))

    expect(response.headers.get("location")).toBe("https://mizan.test/admin")
  })
})
