import { isAddress, zeroAddress } from "viem"

type ModuleParameters = {
  MizanFundingVaultModule: {
    campaignManager: string
    verifier: string
    pauser: string
  }
}

export function validateDeploymentParameters(raw: unknown): ModuleParameters {
  if (!raw || typeof raw !== "object" || !("MizanFundingVaultModule" in raw)) {
    throw new Error("Parameter MizanFundingVaultModule wajib diisi")
  }

  const params = raw.MizanFundingVaultModule
  if (!params || typeof params !== "object") throw new Error("Parameter role wajib diisi")

  function address(key: string): string {
    const value = (params as Record<string, unknown>)[key]
    if (typeof value !== "string" || !isAddress(value) || value.toLowerCase() === zeroAddress) {
      throw new Error(`Parameter ${key} harus address nonzero yang valid`)
    }
    return value
  }

  return {
    MizanFundingVaultModule: {
      campaignManager: address("campaignManager"),
      verifier: address("verifier"),
      pauser: address("pauser"),
    },
  }
}
