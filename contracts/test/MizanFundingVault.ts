import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { keccak256, parseEther, stringToHex } from "viem"
import { network } from "hardhat"

describe("MizanFundingVault", async function () {
  const { viem, networkHelpers } = await network.create()

  const EXTERNAL_REF = keccak256(stringToHex("campaign-uuid-1"))

  async function deployVaultFixture() {
    const [admin, manager, pauser, recipient, funder, stranger] =
      await viem.getWalletClients()

    const vault = await viem.deployContract("MizanFundingVault", [
      admin.account.address,
    ])

    const managerRole = await vault.read.CAMPAIGN_MANAGER_ROLE()
    const pauserRole = await vault.read.PAUSER_ROLE()

    await vault.write.grantRole([managerRole, manager.account.address], {
      account: admin.account,
    })
    await vault.write.grantRole([pauserRole, pauser.account.address], {
      account: admin.account,
    })

    return {
      vault,
      admin,
      manager,
      pauser,
      recipient,
      funder,
      stranger,
      managerRole,
      pauserRole,
    }
  }

  async function fundedCampaignFixture() {
    const ctx = await deployVaultFixture()
    const { vault, manager, recipient, funder } = ctx
    const campaignId = BigInt(1)
    const targetAmount = parseEther("10")
    const fundAmount = parseEther("5")

    await vault.write.registerCampaign(
      [campaignId, EXTERNAL_REF, recipient.account.address, targetAmount],
      { account: manager.account },
    )
    await vault.write.fundCampaign([campaignId], {
      account: funder.account,
      value: fundAmount,
    })

    return { ...ctx, campaignId, targetAmount, fundAmount }
  }

  it("constructor menolak admin zero address", async function () {
    const { vault } = await networkHelpers.loadFixture(deployVaultFixture)

    await viem.assertions.revertWithCustomError(
      viem.deployContract("MizanFundingVault", [
        "0x0000000000000000000000000000000000000000",
      ]),
      vault,
      "InvalidAdmin",
    )
  })

  it("happy path: register → fund → forward langsung ke komunitas", async function () {
    const {
      vault,
      manager,
      recipient,
      funder,
    } = await networkHelpers.loadFixture(deployVaultFixture)
    const campaignId = BigInt(1)
    const targetAmount = parseEther("10")
    const fundAmount = parseEther("5")

    await vault.write.registerCampaign(
      [campaignId, EXTERNAL_REF, recipient.account.address, targetAmount],
      { account: manager.account },
    )

    const before = await viem.getPublicClient().then((client) =>
      client.getBalance({ address: recipient.account.address }),
    )

    await viem.assertions.emitWithArgs(
      vault.write.fundCampaign([campaignId], {
        account: funder.account,
        value: fundAmount,
      }),
      vault,
      "FundsTransferred",
      [campaignId, BigInt(1), funder.account.address, recipient.account.address, fundAmount, fundAmount],
    )

    const after = await viem.getPublicClient().then((client) =>
      client.getBalance({ address: recipient.account.address }),
    )
    assert.equal(after - before, fundAmount)

    const state = await vault.read.getCampaignState([campaignId])
    assert.equal(state[0].toLowerCase(), recipient.account.address.toLowerCase())
    assert.equal(state[1], targetAmount)
    assert.equal(state[2], fundAmount)
    assert.equal(state[3], BigInt(1))
    assert.equal(state[4], true)
    assert.equal(
      await vault.read.contributionOf([campaignId, funder.account.address]),
      fundAmount,
    )
  })

  it("hanya CAMPAIGN_MANAGER yang boleh registerCampaign", async function () {
    const { vault, stranger, recipient } = await networkHelpers.loadFixture(
      deployVaultFixture,
    )

    await viem.assertions.revertWithCustomError(
      vault.write.registerCampaign(
        [BigInt(1), EXTERNAL_REF, recipient.account.address, parseEther("1")],
        { account: stranger.account },
      ),
      vault,
      "AccessControlUnauthorizedAccount",
    )
  })

  it("fundCampaign menolak amount nol dan campaign nonaktif", async function () {
    const { vault, manager, funder, campaignId } =
      await networkHelpers.loadFixture(fundedCampaignFixture)

    await viem.assertions.revertWithCustomError(
      vault.write.fundCampaign([campaignId], {
        account: funder.account,
        value: BigInt(0),
      }),
      vault,
      "InvalidAmount",
    )

    await vault.write.setCampaignActive([campaignId, false], {
      account: manager.account,
    })

    await viem.assertions.revertWithCustomError(
      vault.write.fundCampaign([campaignId], {
        account: funder.account,
        value: parseEther("1"),
      }),
      vault,
      "CampaignNotActive",
    )
  })

  it("pause memblokir funding", async function () {
    const { vault, pauser, funder, campaignId } =
      await networkHelpers.loadFixture(fundedCampaignFixture)

    await vault.write.pause({ account: pauser.account })

    await viem.assertions.revertWithCustomError(
      vault.write.fundCampaign([campaignId], {
        account: funder.account,
        value: parseEther("0.1"),
      }),
      vault,
      "EnforcedPause",
    )
  })
})
