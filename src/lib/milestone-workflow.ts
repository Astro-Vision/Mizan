export type MilestoneStatus =
  | "PENDING"
  | "PROOF_SUBMITTED"
  | "AI_VERIFIED"
  | "REJECTED"
  | "DISBURSEMENT_REQUESTED"
  | "DISBURSED"

export type MilestoneAdminAction = "APPROVE" | "REJECT" | "DISBURSE"

export function canTransitionMilestone(from: MilestoneStatus, to: MilestoneStatus, context: {
  adminApproved?: boolean
  rejectionReason?: string
  receiptConfirmed?: boolean
} = {}) {
  if (to === "PROOF_SUBMITTED") return from === "PENDING" || from === "REJECTED"
  if (to === "AI_VERIFIED") return from === "PROOF_SUBMITTED" || from === "AI_VERIFIED"
  if (to === "REJECTED") return ["PROOF_SUBMITTED", "AI_VERIFIED"].includes(from) && Boolean(context.rejectionReason?.trim())
  if (to === "DISBURSEMENT_REQUESTED") return from === "AI_VERIFIED" && context.adminApproved === true
  return to === "DISBURSED" && from === "DISBURSEMENT_REQUESTED" && context.receiptConfirmed === true
}

export function canEditMilestones(campaign: { reviewStatus: string; contractCampaignId: string | null }, milestones: { status: string }[], hasPayments: boolean) {
  return ["AI_DRAFT", "REJECTED"].includes(campaign.reviewStatus) && !campaign.contractCampaignId && !hasPayments && milestones.every((m) => m.status === "PENDING")
}

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
  if (action === "APPROVE") return "Bukti disetujui admin dan siap diajukan untuk pencairan."
  if (action === "REJECT") return "Bukti ditolak dan perlu dikirim ulang."
  return "Milestone ditandai sudah disalurkan."
}
