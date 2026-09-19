// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/// @title MizanFundingVault
/// @notice Holds campaign funds and releases them after milestone approval.
contract MizanFundingVault is AccessControl, ReentrancyGuard, Pausable {
    // ---------------------------------------------------------------------
    // Roles
    // ---------------------------------------------------------------------

    bytes32 public constant CAMPAIGN_MANAGER_ROLE = keccak256("CAMPAIGN_MANAGER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // ---------------------------------------------------------------------
    // Types
    // ---------------------------------------------------------------------

    enum MilestoneStatus {
        NONE,
        SUBMITTED,
        VERIFIED,
        REJECTED,
        RELEASED
    }

    struct Campaign {
        bytes32 externalRef;
        address recipient;
        uint256 targetAmount;
        uint256 fundedAmount;
        uint256 releasedAmount;
        uint256 reservedAmount;
        bool active;
        bool exists;
    }

    struct Milestone {
        uint256 requestedAmount;
        bytes32 evidenceHash;
        bytes32 assessmentRef;
        bytes32 policyRef;
        MilestoneStatus status;
    }

    // ---------------------------------------------------------------------
    // Storage
    // ---------------------------------------------------------------------

    mapping(uint256 => Campaign) private _campaigns;
    mapping(uint256 => mapping(uint256 => Milestone)) private _milestones;
    mapping(uint256 => mapping(address => uint256)) private _contributions;

    mapping(bytes32 => bool) public releaseKeyUsed;

    uint256 public fundingCount;

    uint256 public maxReleasePerTx;
    uint256 public minMilestoneAmount;

    // ---------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------

    event CampaignRegistered(
        uint256 indexed campaignId,
        bytes32 indexed externalRef,
        address indexed recipient,
        uint256 targetAmount
    );

    event CampaignActiveChanged(uint256 indexed campaignId, bool active);

    event FundsCommitted(
        uint256 indexed campaignId,
        uint256 indexed fundingId,
        address indexed funder,
        uint256 amount,
        uint256 newFundedAmount
    );

    event MilestoneSubmitted(
        uint256 indexed campaignId,
        uint256 indexed milestoneId,
        uint256 requestedAmount,
        bytes32 evidenceHash
    );

    event MilestoneVerified(
        uint256 indexed campaignId,
        uint256 indexed milestoneId,
        bool approved,
        bytes32 assessmentRef,
        bytes32 policyRef
    );

    event FundsReleased(
        uint256 indexed campaignId,
        uint256 indexed milestoneId,
        address indexed recipient,
        uint256 amount,
        bytes32 idempotencyKey
    );

    event ReleaseLimitsUpdated(uint256 maxReleasePerTx, uint256 minMilestoneAmount);

    // ---------------------------------------------------------------------
    // Errors
    // ---------------------------------------------------------------------

    error InvalidAdmin();
    error CampaignAlreadyExists(uint256 campaignId);
    error CampaignNotFound(uint256 campaignId);
    error CampaignNotActive(uint256 campaignId);
    error InvalidRecipient();
    error InvalidAmount();
    error InvalidExternalRef();
    error InvalidEvidenceHash();
    error InvalidAssessmentRef();
    error InvalidIdempotencyKey();
    error MilestoneAlreadyExists(uint256 campaignId, uint256 milestoneId);
    error MilestoneNotSubmitted(uint256 campaignId, uint256 milestoneId, MilestoneStatus current);
    error MilestoneNotVerified(uint256 campaignId, uint256 milestoneId, MilestoneStatus current);
    error InsufficientAvailableFunds(uint256 campaignId, uint256 requested, uint256 available);
    error ReleaseExceedsMaxPerTx(uint256 requested, uint256 maxAllowed);
    error AmountBelowMinimum(uint256 requested, uint256 minimum);
    error IdempotencyKeyUsed(bytes32 key);
    error TransferFailed(address to, uint256 amount);

    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------

    /// @param admin Initial DEFAULT_ADMIN_ROLE holder.
    constructor(address admin) {
        if (admin == address(0)) revert InvalidAdmin();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    // ---------------------------------------------------------------------
    // Campaign
    // ---------------------------------------------------------------------

    /// @notice Registers an approved off-chain campaign.
    /// @param externalRef Off-chain campaign reference hash.
    function registerCampaign(
        uint256 campaignId,
        bytes32 externalRef,
        address recipient,
        uint256 targetAmount
    ) external onlyRole(CAMPAIGN_MANAGER_ROLE) {
        if (_campaigns[campaignId].exists) revert CampaignAlreadyExists(campaignId);
        if (externalRef == bytes32(0)) revert InvalidExternalRef();
        if (recipient == address(0)) revert InvalidRecipient();
        if (targetAmount == 0) revert InvalidAmount();

        Campaign storage c = _campaigns[campaignId];
        c.externalRef = externalRef;
        c.recipient = recipient;
        c.targetAmount = targetAmount;
        c.active = true;
        c.exists = true;

        emit CampaignRegistered(campaignId, externalRef, recipient, targetAmount);
    }

    /// @notice Enables or disables a campaign.
    function setCampaignActive(uint256 campaignId, bool active)
        external
        onlyRole(CAMPAIGN_MANAGER_ROLE)
    {
        Campaign storage c = _requireCampaign(campaignId);
        c.active = active;
        emit CampaignActiveChanged(campaignId, active);
    }

    // ---------------------------------------------------------------------
    // Funding
    // ---------------------------------------------------------------------

    /// @notice Funds a campaign with native BNB.
    function fundCampaign(uint256 campaignId) external payable whenNotPaused nonReentrant {
        Campaign storage c = _requireActiveCampaign(campaignId);
        if (msg.value == 0) revert InvalidAmount();

        c.fundedAmount += msg.value;
        _contributions[campaignId][msg.sender] += msg.value;

        uint256 fundingId = ++fundingCount;

        emit FundsCommitted(campaignId, fundingId, msg.sender, msg.value, c.fundedAmount);
    }

    // ---------------------------------------------------------------------
    // Milestone
    // ---------------------------------------------------------------------

    /// @notice Submits a milestone proof hash for review.
    function submitMilestone(
        uint256 campaignId,
        uint256 milestoneId,
        uint256 requestedAmount,
        bytes32 evidenceHash
    ) external onlyRole(CAMPAIGN_MANAGER_ROLE) whenNotPaused {
        _requireActiveCampaign(campaignId);

        Milestone storage m = _milestones[campaignId][milestoneId];
        if (m.status != MilestoneStatus.NONE) {
            revert MilestoneAlreadyExists(campaignId, milestoneId);
        }
        if (requestedAmount == 0) revert InvalidAmount();
        if (requestedAmount < minMilestoneAmount) {
            revert AmountBelowMinimum(requestedAmount, minMilestoneAmount);
        }
        if (evidenceHash == bytes32(0)) revert InvalidEvidenceHash();

        m.requestedAmount = requestedAmount;
        m.evidenceHash = evidenceHash;
        m.status = MilestoneStatus.SUBMITTED;

        emit MilestoneSubmitted(campaignId, milestoneId, requestedAmount, evidenceHash);
    }

    /// @notice Approves or rejects a submitted milestone.
    /// @param assessmentRef Off-chain assessment reference hash.
    /// @param policyRef Off-chain policy reference hash.
    function verifyMilestone(
        uint256 campaignId,
        uint256 milestoneId,
        bool approved,
        bytes32 assessmentRef,
        bytes32 policyRef
    ) external onlyRole(VERIFIER_ROLE) whenNotPaused {
        Campaign storage c = _requireActiveCampaign(campaignId);
        if (assessmentRef == bytes32(0)) revert InvalidAssessmentRef();

        Milestone storage m = _milestones[campaignId][milestoneId];
        if (m.status != MilestoneStatus.SUBMITTED) {
            revert MilestoneNotSubmitted(campaignId, milestoneId, m.status);
        }

        m.assessmentRef = assessmentRef;
        m.policyRef = policyRef;

        if (approved) {
            uint256 available = _available(c);
            if (m.requestedAmount > available) {
                revert InsufficientAvailableFunds(campaignId, m.requestedAmount, available);
            }
            c.reservedAmount += m.requestedAmount;
            m.status = MilestoneStatus.VERIFIED;
        } else {
            m.status = MilestoneStatus.REJECTED;
        }

        emit MilestoneVerified(campaignId, milestoneId, approved, assessmentRef, policyRef);
    }

    // ---------------------------------------------------------------------
    // Release
    // ---------------------------------------------------------------------

    /// @notice Releases an approved milestone to the campaign recipient.
    /// @param idempotencyKey Unique key that makes release retries safe.
    function releaseFunds(
        uint256 campaignId,
        uint256 milestoneId,
        bytes32 idempotencyKey
    ) external onlyRole(VERIFIER_ROLE) whenNotPaused nonReentrant {
        Campaign storage c = _requireActiveCampaign(campaignId);

        if (idempotencyKey == bytes32(0)) revert InvalidIdempotencyKey();
        if (releaseKeyUsed[idempotencyKey]) revert IdempotencyKeyUsed(idempotencyKey);

        Milestone storage m = _milestones[campaignId][milestoneId];
        if (m.status != MilestoneStatus.VERIFIED) {
            revert MilestoneNotVerified(campaignId, milestoneId, m.status);
        }

        uint256 amount = m.requestedAmount;
        if (maxReleasePerTx != 0 && amount > maxReleasePerTx) {
            revert ReleaseExceedsMaxPerTx(amount, maxReleasePerTx);
        }

        if (amount > c.fundedAmount - c.releasedAmount) {
            revert InsufficientAvailableFunds(
                campaignId,
                amount,
                c.fundedAmount - c.releasedAmount
            );
        }

        address recipient = c.recipient;

        releaseKeyUsed[idempotencyKey] = true;
        c.reservedAmount -= amount;
        c.releasedAmount += amount;
        m.status = MilestoneStatus.RELEASED;

        emit FundsReleased(campaignId, milestoneId, recipient, amount, idempotencyKey);

        _payout(recipient, amount);
    }

    // ---------------------------------------------------------------------
    // Admin
    // ---------------------------------------------------------------------

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /// @notice Sets optional release guardrails. Zero disables each limit.
    function setReleaseLimits(uint256 newMaxReleasePerTx, uint256 newMinMilestoneAmount)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        maxReleasePerTx = newMaxReleasePerTx;
        minMilestoneAmount = newMinMilestoneAmount;
        emit ReleaseLimitsUpdated(newMaxReleasePerTx, newMinMilestoneAmount);
    }

    // ---------------------------------------------------------------------
    // Views
    // ---------------------------------------------------------------------

    function getCampaign(uint256 campaignId) external view returns (Campaign memory) {
        return _requireCampaignView(campaignId);
    }

    function getMilestone(uint256 campaignId, uint256 milestoneId)
        external
        view
        returns (Milestone memory)
    {
        return _milestones[campaignId][milestoneId];
    }

    function availableAmount(uint256 campaignId) public view returns (uint256) {
        Campaign storage c = _campaigns[campaignId];
        if (!c.exists) revert CampaignNotFound(campaignId);
        return _available(c);
    }

    function contributionOf(uint256 campaignId, address funder) external view returns (uint256) {
        return _contributions[campaignId][funder];
    }

    /// @notice Compact campaign state for backend reads.
    function getCampaignState(uint256 campaignId)
        external
        view
        returns (
            address recipient,
            uint256 targetAmount,
            uint256 fundedAmount,
            uint256 releasedAmount,
            uint256 reservedAmount,
            uint256 available,
            bool active
        )
    {
        Campaign storage c = _campaigns[campaignId];
        if (!c.exists) revert CampaignNotFound(campaignId);
        return (
            c.recipient,
            c.targetAmount,
            c.fundedAmount,
            c.releasedAmount,
            c.reservedAmount,
            _available(c),
            c.active
        );
    }

    // ---------------------------------------------------------------------
    // Internals
    // ---------------------------------------------------------------------

    function _available(Campaign storage c) private view returns (uint256) {
        return c.fundedAmount - c.releasedAmount - c.reservedAmount;
    }

    function _requireCampaign(uint256 campaignId) private view returns (Campaign storage c) {
        c = _campaigns[campaignId];
        if (!c.exists) revert CampaignNotFound(campaignId);
    }

    function _requireCampaignView(uint256 campaignId) private view returns (Campaign memory) {
        Campaign memory c = _campaigns[campaignId];
        if (!c.exists) revert CampaignNotFound(campaignId);
        return c;
    }

    function _requireActiveCampaign(uint256 campaignId) private view returns (Campaign storage c) {
        c = _requireCampaign(campaignId);
        if (!c.active) revert CampaignNotActive(campaignId);
    }

    function _payout(address to, uint256 amount) private {
        (bool ok, ) = payable(to).call{value: amount}("");
        if (!ok) revert TransferFailed(to, amount);
    }
}
