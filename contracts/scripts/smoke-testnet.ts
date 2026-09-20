import { existsSync, readFileSync } from "node:fs"
import { loadEnvFile } from "node:process"
import { fileURLToPath } from "node:url"
import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  parseEther,
  stringToHex,
  type Hex,
  type Address,
} from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { bscTestnet } from "viem/chains"

type VaultArtifact = { abi: unknown[] }

const envFile = fileURLToPath(new URL("../.env", import.meta.url))
if (existsSync(envFile)) loadEnvFile(envFile)

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value?.trim()) throw new Error(`Env ${name} wajib diisi di .env`)
  return value.trim()
}

function normalizeKey(raw: string): Hex {
  return (raw.startsWith("0x") ? raw : `0x${raw}`) as Hex
}

const rpcUrl = requireEnv("BSC_TESTNET_RPC_URL")
const funderKey = normalizeKey(requireEnv("DEPLOYER_PRIVATE_KEY"))
const managerKey = normalizeKey(requireEnv("CAMPAIGN_MANAGER_PRIVATE_KEY"))

const deployedPath = fileURLToPath(
  new URL("../ignition/deployments/chain-97/deployed_addresses.json", import.meta.url),
)
const deployed = JSON.parse(readFileSync(deployedPath, "utf8")) as Record<string, string>
const vaultAddress = (process.env.VAULT_ADDRESS?.trim() ||
  deployed["MizanFundingVaultModule#MizanFundingVault"]) as Address
if (!vaultAddress) throw new Error("VAULT_ADDRESS tidak ditemukan")

const artifactPath = fileURLToPath(
  new URL("../artifacts/src/MizanFundingVault.sol/MizanFundingVault.json", import.meta.url),
)
const artifact = JSON.parse(readFileSync(artifactPath, "utf8")) as VaultArtifact

const funder = privateKeyToAccount(funderKey)
const manager = privateKeyToAccount(managerKey)

const publicClient = createPublicClient({ chain: bscTestnet, transport: http(rpcUrl) })
const managerWallet = createWalletClient({
  account: manager,
  chain: bscTestnet,
  transport: http(rpcUrl),
})
const funderWallet = createWalletClient({
  account: funder,
  chain: bscTestnet,
  transport: http(rpcUrl),
})
const campaignId = BigInt(Date.now() % 1_000_000_000)
const targetAmount = parseEther("1")
const fundAmount = parseEther("0.02")
const recipient = funder.address

const externalRef = keccak256(stringToHex(`campaign-${campaignId}`))

async function write(
  label: string,
  wallet: typeof managerWallet,
  functionName: string,
  args: readonly unknown[],
  value?: bigint,
) {
  console.log(`→ ${label} ...`)
  const hash = await wallet.writeContract({
    address: vaultAddress,
    abi: artifact.abi,
    functionName,
    args: args as never[],
    value,
    chain: bscTestnet,
    account: wallet.account,
  })
  const receipt = await publicClient.waitForTransactionReceipt({ hash })
  if (receipt.status !== "success") throw new Error(`${label} gagal: ${hash}`)
  console.log(`  OK  ${hash}`)
  return hash
}

console.log("Vault:", vaultAddress)
console.log("Manager:", manager.address)
console.log("Funder: ", funder.address)
console.log("CampaignId:", campaignId.toString())
console.log("")

await write("registerCampaign", managerWallet, "registerCampaign", [
  campaignId,
  externalRef,
  recipient,
  targetAmount,
])

await write("fundCampaign", funderWallet, "fundCampaign", [campaignId], fundAmount)

const state = await publicClient.readContract({
  address: vaultAddress,
  abi: artifact.abi,
  functionName: "getCampaignState",
  args: [campaignId],
})

console.log("\ngetCampaignState:", state)
console.log("\nSmoke testnet SELESAI.")
console.log(`Lihat kontrak: https://testnet.bscscan.com/address/${vaultAddress}`)
