export type UserRole = "BENEFACTOR" | "BENEFICIARY" | "ADMIN"
export type OnboardingUserType = "BENEFACTOR" | "BENEFICIARY" | "DONOR"

/**
 * Menentukan halaman awal setelah autentikasi selesai.
 * Tipe profil dipakai sebagai fallback selama onboarding belum selesai.
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
    case "BENEFICIARY":
      return "/penerima"
  }
}

export function getOnboardingUserType(
  userType?: string | null
): OnboardingUserType | null {
  switch (userType) {
    case "DONOR":
    case "BENEFICIARY":
      return "/penerima"
    case "BENEFACTOR":
    case "DONOR":
    default:
      return null
  }
}

export function getRoleForOnboardingUserType(
  userType: OnboardingUserType,
): Exclude<UserRole, "ADMIN"> {
  return userType === "BENEFICIARY" ? "BENEFICIARY" : "BENEFACTOR"
}
