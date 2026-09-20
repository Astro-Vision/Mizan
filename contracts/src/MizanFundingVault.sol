// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/// @title MizanFundingVault
/// @notice Registers approved campaigns and forwards native BNB contributions.
contract MizanFundingVault is AccessControl, ReentrancyGuard, Pausable {
    bytes32 public constant CAMPAIGN_MANAGER_ROLE = keccak256("CAMPAIGN_MANAGER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    struct Campaign {
        bytes32 externalRef;
        address recipient;
        uint256 targetAmount;
        uint256 fundedAmount;
        uint256 contributionCount;
        bool active;
        bool exists;
    }

    mapping(uint256 => Campaign) private _campaigns;
    mapping(uint256 => mapping(address => uint256)) private _contributions;

    uint256 public fundingCount;

    event CampaignRegistered(
        uint256 indexed campaignId,
        bytes32 indexed externalRef,
        address indexed recipient,
        uint256 targetAmount
    );
    event CampaignActiveChanged(uint256 indexed campaignId, bool active);
    event FundsTransferred(
        uint256 indexed campaignId,
        uint256 indexed fundingId,
        address indexed funder,
        address recipient,
        uint256 amount,
        uint256 newFundedAmount
    );

    error InvalidAdmin();
    error CampaignAlreadyExists(uint256 campaignId);
    error CampaignNotFound(uint256 campaignId);
    error CampaignNotActive(uint256 campaignId);
    error InvalidRecipient();
    error InvalidAmount();
    error InvalidExternalRef();
    error TransferFailed(address to, uint256 amount);

    constructor(address admin) {
        if (admin == address(0)) revert InvalidAdmin();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    /// @notice Registers an approved off-chain campaign.
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

        _campaigns[campaignId] = Campaign({
            externalRef: externalRef,
            recipient: recipient,
            targetAmount: targetAmount,
            fundedAmount: 0,
            contributionCount: 0,
            active: true,
            exists: true
        });

        emit CampaignRegistered(campaignId, externalRef, recipient, targetAmount);
    }

    function setCampaignActive(uint256 campaignId, bool active)
        external
        onlyRole(CAMPAIGN_MANAGER_ROLE)
    {
        Campaign storage campaign = _requireCampaign(campaignId);
        campaign.active = active;
        emit CampaignActiveChanged(campaignId, active);
    }

    /// @notice Forwards native BNB to the campaign recipient and records the contribution.
    function fundCampaign(uint256 campaignId) external payable whenNotPaused nonReentrant {
        Campaign storage campaign = _requireActiveCampaign(campaignId);
        if (msg.value == 0) revert InvalidAmount();

        campaign.fundedAmount += msg.value;
        campaign.contributionCount += 1;
        _contributions[campaignId][msg.sender] += msg.value;
        uint256 fundingId = ++fundingCount;

        _payout(campaign.recipient, msg.value);
        emit FundsTransferred(
            campaignId,
            fundingId,
            msg.sender,
            campaign.recipient,
            msg.value,
            campaign.fundedAmount
        );
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function getCampaign(uint256 campaignId) external view returns (Campaign memory) {
        return _requireCampaignView(campaignId);
    }

    /// @notice Compact campaign state for backend reads.
    function getCampaignState(uint256 campaignId)
        external
        view
        returns (
            address recipient,
            uint256 targetAmount,
            uint256 fundedAmount,
            uint256 contributionCount,
            bool active
        )
    {
        Campaign storage campaign = _requireCampaign(campaignId);
        return (
            campaign.recipient,
            campaign.targetAmount,
            campaign.fundedAmount,
            campaign.contributionCount,
            campaign.active
        );
    }

    function contributionOf(uint256 campaignId, address funder) external view returns (uint256) {
        return _contributions[campaignId][funder];
    }

    function _requireCampaign(uint256 campaignId) private view returns (Campaign storage campaign) {
        campaign = _campaigns[campaignId];
        if (!campaign.exists) revert CampaignNotFound(campaignId);
    }

    function _requireCampaignView(uint256 campaignId)
        private
        view
        returns (Campaign memory campaign)
    {
        campaign = _campaigns[campaignId];
        if (!campaign.exists) revert CampaignNotFound(campaignId);
    }

    function _requireActiveCampaign(uint256 campaignId)
        private
        view
        returns (Campaign storage campaign)
    {
        campaign = _requireCampaign(campaignId);
        if (!campaign.active) revert CampaignNotActive(campaignId);
    }

    function _payout(address to, uint256 amount) private {
        (bool ok, ) = payable(to).call{value: amount}("");
        if (!ok) revert TransferFailed(to, amount);
    }
}
