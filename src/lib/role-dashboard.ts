export type UserRole = "USER" | "ADMIN" | "BENEFACTOR" | "BENEFACTORY"
export type OnboardingUserType = "DONOR" | "BENEFICIARY" | "ORGANIZATION"

/**
 * Menentukan halaman awal setelah autentikasi selesai.
 * USER adalah role default sebelum onboarding; tipe profilnya tetap dipakai
 * sebagai fallback agar pengguna tidak kembali ke landing page.
 */
export function getDashboardPath(
  role?: string | null,
  userType?: string | null,
): string {
  const roleDashboardPath = getRoleDashboardPath(role)

  if (roleDashboardPath) {
    return roleDashboardPath
  }

  switch (userType) {
    case "BENEFICIARY":
    case "ORGANIZATION":
      return "/penerima"
    case "DONOR":
    default:
      return "/donatur"
  }
}

export function getRoleDashboardPath(role?: string | null): string | null {
  switch (role) {
    case "ADMIN":
      return "/admin"
    case "BENEFACTOR":
      return "/donatur"
    case "BENEFACTORY":
      return "/penerima"
    default:
      return null
  }
}

export function getOnboardingUserType(
  userType?: string | null
): OnboardingUserType | null {
  switch (userType) {
    case "DONOR":
    case "BENEFICIARY":
    case "ORGANIZATION":
      return userType
    default:
      return null
  }
}

export function getRoleForOnboardingUserType(
  userType: OnboardingUserType,
): Exclude<UserRole, "USER" | "ADMIN"> {
  return userType === "DONOR" ? "BENEFACTOR" : "BENEFACTORY"
}
