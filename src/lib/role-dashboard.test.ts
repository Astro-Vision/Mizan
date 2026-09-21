import { describe, expect, it } from "vitest"

import {
  getDashboardPath,
  getOnboardingUserType,
  getRoleDashboardPath,
  getRoleForOnboardingUserType,
} from "./role-dashboard"

describe("role dashboard routing", () => {
  it.each([
    ["ADMIN", undefined, "/admin"],
    ["BENEFACTOR", undefined, "/donatur"],
    ["BENEFACTORY", undefined, "/penerima"],
    ["USER", "DONOR", "/donatur"],
    ["USER", "BENEFICIARY", "/penerima"],
    ["USER", "ORGANIZATION", "/penerima"],
  ])("routes %s/%s to %s", (role, userType, expectedPath) => {
    expect(getDashboardPath(role, userType)).toBe(expectedPath)
  })

  it("keeps an incomplete or legacy USER account on a dashboard", () => {
    expect(getDashboardPath("USER")).toBe("/donatur")
    expect(getDashboardPath(null, null)).toBe("/donatur")
  })

  it("maps onboarding choices to non-admin application roles", () => {
    expect(getRoleForOnboardingUserType("DONOR")).toBe("BENEFACTOR")
    expect(getRoleForOnboardingUserType("BENEFICIARY")).toBe("BENEFACTORY")
    expect(getRoleForOnboardingUserType("ORGANIZATION")).toBe("BENEFACTORY")
  })

  it("only maps complete application roles to protected dashboards", () => {
    expect(getRoleDashboardPath("ADMIN")).toBe("/admin")
    expect(getRoleDashboardPath("BENEFACTOR")).toBe("/donatur")
    expect(getRoleDashboardPath("BENEFACTORY")).toBe("/penerima")
    expect(getRoleDashboardPath("USER")).toBeNull()
    expect(getRoleDashboardPath(null)).toBeNull()
  })

  it("only accepts known onboarding user types", () => {
    expect(getOnboardingUserType("DONOR")).toBe("DONOR")
    expect(getOnboardingUserType("BENEFICIARY")).toBe("BENEFICIARY")
    expect(getOnboardingUserType("ORGANIZATION")).toBe("ORGANIZATION")
    expect(getOnboardingUserType("UNKNOWN")).toBeNull()
  })
})
