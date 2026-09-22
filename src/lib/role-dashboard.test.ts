import { describe, expect, it } from "vitest"

import { getDashboardPath, getRoleForOnboardingUserType } from "./role-dashboard"

describe("role dashboard routing", () => {
  it.each([
    ["ADMIN", undefined, "/admin"],
    ["BENEFACTOR", undefined, "/donatur"],
    ["BENEFICIARY", undefined, "/penerima"],
    ["BENEFACTOR", "BENEFACTOR", "/donatur"],
    ["BENEFACTOR", "DONOR", "/donatur"],
    ["BENEFICIARY", "BENEFICIARY", "/penerima"],
  ])("routes %s/%s to %s", (role, userType, expectedPath) => {
    expect(getDashboardPath(role, userType)).toBe(expectedPath)
  })

  it("keeps an incomplete account on a dashboard using its user type", () => {
    expect(getDashboardPath(undefined, "BENEFACTOR")).toBe("/donatur")
    expect(getDashboardPath(undefined, "DONOR")).toBe("/donatur")
    expect(getDashboardPath(undefined, "BENEFICIARY")).toBe("/penerima")
    expect(getDashboardPath(null, null)).toBe("/donatur")
  })

  it("maps onboarding choices to non-admin application roles", () => {
    expect(getRoleForOnboardingUserType("BENEFACTOR")).toBe("BENEFACTOR")
    expect(getRoleForOnboardingUserType("DONOR")).toBe("BENEFACTOR")
    expect(getRoleForOnboardingUserType("BENEFICIARY")).toBe("BENEFICIARY")
  })
})
