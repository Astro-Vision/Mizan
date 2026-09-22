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
  switch (role) {
    case "ADMIN":
      return "/admin"
    case "BENEFACTOR":
      return "/donatur"
    case "BENEFICIARY":
      return "/penerima"
  }

  switch (userType) {
    case "BENEFICIARY":
      return "/penerima"
    case "BENEFACTOR":
    case "DONOR":
    default:
      return "/donatur"
  }
}

export function getRoleForOnboardingUserType(
  userType: OnboardingUserType,
): Exclude<UserRole, "ADMIN"> {
  return userType === "BENEFICIARY" ? "BENEFICIARY" : "BENEFACTOR"
}
