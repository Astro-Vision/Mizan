export type MilestoneStatus =
  | "PENDING"
  | "PROOF_SUBMITTED"
  | "AI_VERIFIED"
  | "REJECTED"
  | "DISBURSEMENT_REQUESTED"
  | "DISBURSED"

export type MilestoneAdminAction = "APPROVE" | "REJECT" | "DISBURSE"

const allowedTransitions: Record<MilestoneAdminAction, MilestoneStatus[]> = {
  APPROVE: ["PROOF_SUBMITTED", "AI_VERIFIED"],
  REJECT: ["PROOF_SUBMITTED", "AI_VERIFIED"],
  DISBURSE: ["DISBURSEMENT_REQUESTED"],
}

export function canApplyMilestoneAdminAction(
  status: MilestoneStatus,
  action: MilestoneAdminAction,
): boolean {
  return allowedTransitions[action].includes(status)
}

export function milestoneAdminActionMessage(action: MilestoneAdminAction): string {
  if (action === "APPROVE") return "Bukti disetujui dan masuk antrean pencairan."
  if (action === "REJECT") return "Bukti ditolak dan perlu dikirim ulang."
  return "Milestone ditandai sudah disalurkan."
}
