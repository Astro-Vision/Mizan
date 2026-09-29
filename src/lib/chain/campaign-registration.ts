import "server-only"

import {
  createPublicClient,
  createWalletClient,
  http,
  isAddress,
  keccak256,
  parseAbi,
  stringToHex,
  type Hex,
} from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { bscTestnet } from "viem/chains"
import { getConfiguredVaultAddress } from "./vault"

const ABI = parseAbi([
  "function registerCampaign(uint256 campaignId, bytes32 externalRef, address recipient, uint256 targetAmount)",
])

export async function registerCampaignOnChain(params: {
  campaignId: string
  externalRef: string
  recipient: string
  targetAmountWei: string
}): Promise<{ transactionHash: string; contractCampaignId: string }> {
  if (
    !/^\d+$/.test(params.campaignId) ||
    BigInt(params.campaignId) === BigInt(0)
  )
    throw new Error("Campaign ID tidak valid.")
  if (!params.externalRef.trim())
    throw new Error("Referensi campaign wajib diisi.")
  if (!isAddress(params.recipient))
    throw new Error("Wallet penerima tidak valid.")
  if (!/^[1-9]\d*$/.test(params.targetAmountWei))
    throw new Error("Target campaign tidak valid.")

  const privateKey = process.env.MIZAN_MANAGER_PRIVATE_KEY as Hex | undefined
  if (!privateKey || !/^0x[a-fA-F0-9]{64}$/.test(privateKey))
    throw new Error("MIZAN_MANAGER_PRIVATE_KEY belum dikonfigurasi.")

  const rpcUrl = process.env.BSC_TESTNET_RPC_URL
  const account = privateKeyToAccount(privateKey)
  const transport = http(rpcUrl)
  const publicClient = createPublicClient({ chain: bscTestnet, transport })
  const walletClient = createWalletClient({
    account,
    chain: bscTestnet,
    transport,
  })
  const contractCampaignId = params.campaignId
  const transactionHash = await walletClient.writeContract({
    address: getConfiguredVaultAddress() as Hex,
    abi: ABI,
    functionName: "registerCampaign",
    args: [
      BigInt(contractCampaignId),
      keccak256(stringToHex(params.externalRef)),
      params.recipient as Hex,
      BigInt(params.targetAmountWei),
    ],
  })
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: transactionHash,
  })
  if (receipt.status !== "success")
    throw new Error("Transaksi registrasi campaign gagal.")

  return { transactionHash, contractCampaignId }
}
