import { existsSync } from "node:fs"
import { loadEnvFile } from "node:process"
import { fileURLToPath } from "node:url"
import { defineConfig, configVariable } from "hardhat/config"
import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem"

// Node >=22 (required by Hardhat). Shell env takes precedence over this file.
const envFile = fileURLToPath(new URL("./.env", import.meta.url))
if (existsSync(envFile)) loadEnvFile(envFile)

export default defineConfig({
  plugins: [hardhatToolboxViem],

  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      // Sengaja shanghai, bukan cancun: bytecode harus aman di BSC tanpa
      // bergantung pada opcode transient storage. Konsekuensinya jangan
      // memakai ReentrancyGuardTransient.
      evmVersion: "shanghai",
    },
  },

  paths: {
    sources: "./src",
  },

  networks: {
    // Jaringan simulasi in-memory untuk test dan percobaan lokal.
    hardhatSim: {
      type: "edr-simulated",
      chainType: "l1",
    },
    bscTestnet: {
      type: "http",
      chainType: "l1",
      url: configVariable("BSC_TESTNET_RPC_URL"),
      accounts: [configVariable("DEPLOYER_PRIVATE_KEY")],
      chainId: 97,
    },
  },
})
