const AI_CONFIDENCE_THRESHOLD = 0.5

export type MilestoneVerificationStatus = "AI_VERIFIED" | "PROOF_SUBMITTED"

export const resolveMilestoneVerificationStatus = (result: {
  verified: boolean
  confidence: number
}): MilestoneVerificationStatus => {
  if (result.verified === true && Number.isFinite(result.confidence) && result.confidence >= AI_CONFIDENCE_THRESHOLD && result.confidence <= 1) {
    return "AI_VERIFIED"
  }

  return "PROOF_SUBMITTED"
}
