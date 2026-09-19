import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { keccak256, stringToHex, parseEther } from "viem"
import { network } from "hardhat"

describe("MizanFundingVault", async function () {
  const { viem, networkHelpers } = await network.create()

  const EXTERNAL_REF = keccak256(stringToHex("campaign-uuid-1"))
  const EVIDENCE_HASH = keccak256(stringToHex("evidence-bundle-v1"))
  const ASSESSMENT_REF = keccak256(stringToHex("assessment-v1"))
  const POLICY_REF = keccak256(stringToHex("policy-v1"))
  const IDEMPOTENCY_KEY = keccak256(stringToHex("release-1-0-v1"))

  async function deployVaultFixture() {
    const [admin, manager, verifier, pauser, recipient, funder, stranger] =
      await viem.getWalletClients()

    const vault = await viem.deployContract("MizanFundingVault", [
      admin.account.address,
    ])

    const managerRole = await vault.read.CAMPAIGN_MANAGER_ROLE()
    const verifierRole = await vault.read.VERIFIER_ROLE()
    const pauserRole = await vault.read.PAUSER_ROLE()

    await vault.write.grantRole([managerRole, manager.account.address], {
      account: admin.account,
    })
    await vault.write.grantRole([verifierRole, verifier.account.address], {
      account: admin.account,
    })
    await vault.write.grantRole([pauserRole, pauser.account.address], {
      account: admin.account,
    })

    return {
      vault,
      admin,
      manager,
      verifier,
      pauser,
      recipient,
      funder,
      stranger,
      managerRole,
      verifierRole,
      pauserRole,
    }
  }

  async function fundedCampaignFixture() {
    const ctx = await deployVaultFixture()
    const { vault, manager, recipient, funder } = ctx
    const campaignId = 1n
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

  it("happy path: register → fund → submit → verify → release", async function () {
    const {
      vault,
      manager,
      verifier,
      recipient,
      funder,
      campaignId,
      fundAmount,
    } = await networkHelpers.loadFixture(fundedCampaignFixture)

    const milestoneId = 1n
    const requested = parseEther("2")

    await vault.write.submitMilestone(
      [campaignId, milestoneId, requested, EVIDENCE_HASH],
      { account: manager.account },
    )

    await vault.write.verifyMilestone(
      [campaignId, milestoneId, true, ASSESSMENT_REF, POLICY_REF],
      { account: verifier.account },
    )

    const before = await viem.getPublicClient().then((c) =>
      c.getBalance({ address: recipient.account.address }),
    )

    await viem.assertions.emitWithArgs(
      vault.write.releaseFunds([campaignId, milestoneId, IDEMPOTENCY_KEY], {
        account: verifier.account,
      }),
      vault,
      "FundsReleased",
      [
        campaignId,
        milestoneId,
        recipient.account.address,
        requested,
        IDEMPOTENCY_KEY,
      ],
    )

    const after = await viem.getPublicClient().then((c) =>
      c.getBalance({ address: recipient.account.address }),
    )
    assert.equal(after - before, requested)

    const state = await vault.read.getCampaignState([campaignId])
    assert.equal(state[2], fundAmount) // fundedAmount
    assert.equal(state[3], requested) // releasedAmount
    assert.equal(state[4], 0n) // reservedAmount
    assert.equal(state[5], fundAmount - requested) // available

    assert.equal(
      await vault.read.contributionOf([campaignId, funder.account.address]),
      fundAmount,
    )

    const milestone = await vault.read.getMilestone([campaignId, milestoneId])
    assert.equal(milestone.status, 4) // MilestoneStatus.RELEASED
  })

  it("hanya CAMPAIGN_MANAGER yang boleh registerCampaign", async function () {
    const { vault, stranger, recipient } = await networkHelpers.loadFixture(
      deployVaultFixture,
    )

    await viem.assertions.revertWithCustomError(
      vault.write.registerCampaign(
        [1n, EXTERNAL_REF, recipient.account.address, parseEther("1")],
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
        value: 0n,
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

  it("verify menolak jika dana tidak cukup, dan reject tidak me-reserve", async function () {
    const { vault, manager, verifier, campaignId, fundAmount } =
      await networkHelpers.loadFixture(fundedCampaignFixture)

    const milestoneId = 1n
    const tooMuch = fundAmount + 1n

    await vault.write.submitMilestone(
      [campaignId, milestoneId, tooMuch, EVIDENCE_HASH],
      { account: manager.account },
    )

    await viem.assertions.revertWithCustomError(
      vault.write.verifyMilestone(
        [campaignId, milestoneId, true, ASSESSMENT_REF, POLICY_REF],
        { account: verifier.account },
      ),
      vault,
      "InsufficientAvailableFunds",
    )

    const rejectId = 2n
    await vault.write.submitMilestone(
      [campaignId, rejectId, parseEther("1"), EVIDENCE_HASH],
      { account: manager.account },
    )
    await vault.write.verifyMilestone(
      [campaignId, rejectId, false, ASSESSMENT_REF, POLICY_REF],
      { account: verifier.account },
    )

    const state = await vault.read.getCampaignState([campaignId])
    assert.equal(state[4], 0n) // reservedAmount tetap 0
    assert.equal(state[5], fundAmount)

    const rejected = await vault.read.getMilestone([campaignId, rejectId])
    assert.equal(rejected.status, 3) // REJECTED
  })

  it("release menolak retry dengan idempotency key yang sama", async function () {
    const { vault, manager, verifier, campaignId } =
      await networkHelpers.loadFixture(fundedCampaignFixture)

    const milestoneId = 1n
    const requested = parseEther("1")

    await vault.write.submitMilestone(
      [campaignId, milestoneId, requested, EVIDENCE_HASH],
      { account: manager.account },
    )
    await vault.write.verifyMilestone(
      [campaignId, milestoneId, true, ASSESSMENT_REF, POLICY_REF],
      { account: verifier.account },
    )
    await vault.write.releaseFunds([campaignId, milestoneId, IDEMPOTENCY_KEY], {
      account: verifier.account,
    })

    await viem.assertions.revertWithCustomError(
      vault.write.releaseFunds([campaignId, milestoneId, IDEMPOTENCY_KEY], {
        account: verifier.account,
      }),
      vault,
      "IdempotencyKeyUsed",
    )
  })

  it("pause memblokir funding dan operasi milestone", async function () {
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

  it("admin dapat mengatur release limits", async function () {
    const { vault, admin, manager, campaignId } =
      await networkHelpers.loadFixture(fundedCampaignFixture)

    const maxPerTx = parseEther("1")
    const minMilestone = parseEther("0.5")

    await viem.assertions.emitWithArgs(
      vault.write.setReleaseLimits([maxPerTx, minMilestone], {
        account: admin.account,
      }),
      vault,
      "ReleaseLimitsUpdated",
      [maxPerTx, minMilestone],
    )

    assert.equal(await vault.read.maxReleasePerTx(), maxPerTx)
    assert.equal(await vault.read.minMilestoneAmount(), minMilestone)

    await viem.assertions.revertWithCustomError(
      vault.write.submitMilestone(
        [campaignId, 99n, parseEther("0.1"), EVIDENCE_HASH],
        { account: manager.account },
      ),
      vault,
      "AmountBelowMinimum",
    )
  })
})
