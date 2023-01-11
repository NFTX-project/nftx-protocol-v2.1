// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.4;

import {Script} from "forge-std/Script.sol";

import {Ownable} from "@src/util/Ownable.sol";

/// @notice script to transfer ownership of all our Arbitrum contracts to the multisig
contract ArbiTransferOwnership is Script {
    address constant ARBI_MULTISIG = 0x3863A65CE278a240f9Aa2A4b4A48493bE59E6139;

    address[] contracts = [
        0x66f26E38bD50FD52A50da8E87E435f04f98001B7, // NFTXMarketplaceZap
        0x3BD7512966CbC3406962f8877edbE80aea8A2904, // NFTXMarketplace0xZap
        0xfb8664E4EB4d2F8B0220d358d0d9C4896DC84959, // NFTXStakingZap
        0x009e4110Fd68c603DD1F9189C4BaC3D12Cde8c70, // NFTXUnstakingInventoryZap
        0xB25Ea886FcE4bfDC8750Cb2D4464FE3F7A67bc07, // NFTXUnstakingInventoryZap (new with dust fix)
        0x96C394Cdd3B09B7B2971Aa6FB8c0435C914E1Df9, // TimelockExcludeList
        0x732E5F7FE7c40333DfeFF57755666F85d1e164c1, // MultiProxyController
        0xE77b89FEc41A7b7dC74eb33602e82F0672FbB33C, // NFTXVaultFactoryUpgradeable
        0x68A7F493F6C40556931559afD22D7eD868d3f78E, // NFTXSimpleFeeDistributor
        0x5326A720f76CFbDfE9e18fA618C3a3f7AbDF3934, // NFTXLPStaking
        0x92B80faa01389B753F41Faf90e1C46Dc975830d5, // StakingTokenProvider
        0x1a0f3D0e40E9c211BD2D215E709b6FD2C17f35a2, // NFTXEligibilityManager
        0x1A2C03ABD4Af7C87d8b4d5aD39b56fa98E8C4Cc6 // NFTXInventoryStaking
    ];

    modifier shouldBroadcast() {
        vm.startBroadcast();
        _;
        vm.stopBroadcast();
    }

    function run() external shouldBroadcast {
        for (uint256 i; i < contracts.length; ++i) {
            Ownable(contracts[i]).transferOwnership(ARBI_MULTISIG);
        }
    }
}
