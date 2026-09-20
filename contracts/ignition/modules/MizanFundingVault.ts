import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"

export default buildModule("MizanFundingVaultModule", (m) => {
  const deployer = m.getAccount(0)
  const vault = m.contract("MizanFundingVault", [deployer])

  const campaignManager = m.getParameter("campaignManager")
  const pauser = m.getParameter("pauser")

  const managerRole = m.staticCall(vault, "CAMPAIGN_MANAGER_ROLE")
  const pauserRole = m.staticCall(vault, "PAUSER_ROLE")

  m.call(vault, "grantRole", [managerRole, campaignManager], {
    id: "grantCampaignManagerRole",
  })
  m.call(vault, "grantRole", [pauserRole, pauser], {
    id: "grantPauserRole",
  })

  return { vault }
})
