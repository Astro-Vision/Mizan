const AI_CONFIDENCE_THRESHOLD = 0.5

export type MilestoneVerificationStatus = "AI_VERIFIED" | "PROOF_SUBMITTED"

export const resolveMilestoneVerificationStatus = (result: {
  verified: boolean
  confidence: number
}): MilestoneVerificationStatus => {
  if (result.verified && result.confidence >= AI_CONFIDENCE_THRESHOLD) {
    return "AI_VERIFIED"
  }

  return "PROOF_SUBMITTED"
}
