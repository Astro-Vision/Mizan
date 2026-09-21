import { describe, expect, it } from "vitest"

import { getDashboardPath, getRoleForOnboardingUserType } from "./role-dashboard"

describe("role dashboard routing", () => {
  it.each([
    ["ADMIN", undefined, "/admin"],
    ["BENEFACTOR", undefined, "/donatur"],
    ["BENEFICIARY", undefined, "/penerima"],
    ["BENEFACTOR", "DONOR", "/donatur"],
    ["BENEFICIARY", "BENEFICIARY", "/penerima"],
    ["BENEFICIARY", "ORGANIZATION", "/penerima"],
  ])("routes %s/%s to %s", (role, userType, expectedPath) => {
    expect(getDashboardPath(role, userType)).toBe(expectedPath)
  })

  it("keeps an incomplete account on a dashboard using its user type", () => {
    expect(getDashboardPath(undefined, "DONOR")).toBe("/donatur")
    expect(getDashboardPath(undefined, "BENEFICIARY")).toBe("/penerima")
    expect(getDashboardPath(null, null)).toBe("/donatur")
  })

  it("maps onboarding choices to non-admin application roles", () => {
    expect(getRoleForOnboardingUserType("DONOR")).toBe("BENEFACTOR")
    expect(getRoleForOnboardingUserType("BENEFICIARY")).toBe("BENEFICIARY")
    expect(getRoleForOnboardingUserType("ORGANIZATION")).toBe("BENEFICIARY")
  })
})
