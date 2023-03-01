// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {Test} from 'forge-std/Test.sol';

import {NFTXStakingZap} from "@src/NFTXStakingZap.sol";
import {IERC20} from '@src/testing/IERC20.sol';
import {IERC721} from '@src/testing/IERC721.sol';
import {SweepAndStakeZap} from '@src/zaps/NFTXSweepAndStakeZap.sol';
import {TimelockExcludeList} from '@src/other/TimelockExcludeList.sol';

import {INFTXVault} from "@src/interface/INFTXVault.sol";

/**
 * ..
 */
contract SweepAndStakeZapTest is Test {

    /// Store our mainnet fork information
    uint256 mainnetFork;
    uint256 internal constant BLOCK_NUMBER = 16_189_167;

    /// Store our PUNK related data
    address internal constant NFT_TOKEN = 0x524cAB2ec69124574082676e6F654a18df49A048;
    address internal constant NFT_VAULT = 0xB603B3fc4B5aD885e26298b7862Bb6074dff32A9;

    /// Our staking zap
    address payable internal constant STAKING_ZAP = payable(0xdC774D5260ec66e5DD4627E1DD800Eff3911345C);

    SweepAndStakeZap zap;

    constructor() {
        // Generate a mainnet fork
        mainnetFork = vm.createFork(vm.envString("MAINNET_RPC_URL"));
        vm.selectFork(mainnetFork);
        vm.rollFork(BLOCK_NUMBER);

        // Confirm that our block number has set successfully
        assertEq(block.number, BLOCK_NUMBER);

        // Deploy our sweep and stake zap contract
        zap = new SweepAndStakeZap();

        // Configure our zap
        zap.setGemSwap(0x1f1606FEeE5b2AFD1e34C5F09B44A8208D6aEECC);
        zap.setStakingContracts(STAKING_ZAP);

        // Set our sweep and stake zap to be excluded from fees and timelock
        vm.startPrank(0x40D73Df4F99bae688CE3C23a01022224FE16C7b2);
        TimelockExcludeList(0xd44198F1257dc88A8Eb5a2dbb389179647c0d6B9).setExcludeFromAll(address(zap), true);
        vm.stopPrank();
    }

    function test_CanStakeInventory() external {
        uint[] memory tokenIds = new uint[](5);
        tokenIds[0] = 12736;
        tokenIds[1] = 16706;
        tokenIds[2] = 16891;
        tokenIds[3] = 18485;
        tokenIds[4] = 21420;

        // This will sweep 5 NFTs
        zap.sweepAndStake{value: 20 ether}(NFT_VAULT, 20 ether, tokenIds, 0, hex'6d8b99f700000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000022c5b4041d2442ae0000000000000000000000001b3cb81e51011b549d78bf720b0d924ac763a7c200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000031c0000000000000000000000000000000000000000000000000000000000000414200000000000000000000000000000000000000000000000000000000000041fb000000000000000000000000000000000000000000000000000000000000483500000000000000000000000000000000000000000000000000000000000053ac72db8c0b');

        assertEq(IERC20(NFT_VAULT).balanceOf(address(zap)), 1);
        assertEq(IERC20(NFT_VAULT).balanceOf(address(this)), 2);

        assertEq(IERC721(NFT_TOKEN).ownerOf(12736), NFT_VAULT);
        assertEq(IERC721(NFT_TOKEN).ownerOf(16706), NFT_VAULT);
        assertEq(IERC721(NFT_TOKEN).ownerOf(16891), NFT_VAULT);
        assertEq(IERC721(NFT_TOKEN).ownerOf(18485), NFT_VAULT);
        assertEq(IERC721(NFT_TOKEN).ownerOf(21420), NFT_VAULT);
    }

    function test_CanStakeLiquidity() external {}

    receive() external payable {}

}
