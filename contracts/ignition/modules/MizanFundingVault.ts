import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"

/**
 * Deploy MizanFundingVault lalu membagikan role operasional.
 *
 * Constructor hanya memberi DEFAULT_ADMIN_ROLE. CAMPAIGN_MANAGER_ROLE,
 * VERIFIER_ROLE, dan PAUSER_ROLE di-grant di sini supaya pemisahan wewenang
 * terjadi sejak deploy dan tercatat sebagai event RoleGranted.
 *
 * Deployer sengaja selalu menjadi admin awal, karena hanya pemegang
 * DEFAULT_ADMIN_ROLE yang dapat melakukan grantRole. Kalau admin akhir harus
 * address lain, lakukan setelah deploy: grant DEFAULT_ADMIN_ROLE ke address
 * tersebut lalu revoke dari deployer.
 *
 * Parameter address operasional wajib; npm run deploy:testnet memvalidasi nonzero
 * dan read-back role. CLI langsung di bawah hanya untuk operator yang sudah
 * memvalidasi parameter:
 *
 *   npx hardhat ignition deploy ignition/modules/MizanFundingVault.ts \
 *     --network bscTestnet --parameters ignition/params.bscTestnet.json
 */
export default buildModule("MizanFundingVaultModule", (m) => {
  const deployer = m.getAccount(0)

  const vault = m.contract("MizanFundingVault", [deployer])

  const campaignManager = m.getParameter("campaignManager")
  const verifier = m.getParameter("verifier")
  const pauser = m.getParameter("pauser")

  const managerRole = m.staticCall(vault, "CAMPAIGN_MANAGER_ROLE")
  const verifierRole = m.staticCall(vault, "VERIFIER_ROLE")
  const pauserRole = m.staticCall(vault, "PAUSER_ROLE")

  m.call(vault, "grantRole", [managerRole, campaignManager], {
    id: "grantCampaignManagerRole",
  })
  m.call(vault, "grantRole", [verifierRole, verifier], {
    id: "grantVerifierRole",
  })
  m.call(vault, "grantRole", [pauserRole, pauser], {
    id: "grantPauserRole",
  })

  return { vault }
})
