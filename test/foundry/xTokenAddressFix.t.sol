// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import {NFTXInventoryStaking} from "@src/NFTXInventoryStaking.sol";
import {MultiProxyController} from "@src/proxy/MultiProxyController.sol";
import {XTokenUpgradeable} from "@src/token/XTokenUpgradeable.sol";
import {IERC20Upgradeable} from "@src/token/IERC20Upgradeable.sol";

contract xTokenAddressFix is Test {
    uint256 internal constant BLOCK_NUMBER = 16550580;

    address constant MULTISIG = 0xaA29881aAc939A025A3ab58024D7dd46200fB93D;

    NFTXInventoryStaking inventoryStakingProxy =
        NFTXInventoryStaking(0x3E135c3E981fAe3383A5aE0d323860a34CfAB893);
    MultiProxyController multiProxyController =
        MultiProxyController(0x35fb4026dcF19f8cA37dcca4D2D68A549548750C);

    uint256 internal constant VAULT_ID = 27;
    address constant SQGL = 0x8d137e3337eb1B58A222Fef2B2Cc7C423903d9cf;
    address constant xSQGL = 0x929Fd5879847F41f05B6Cf3746b4343f38b8741B;
    address constant duplicate_xSQGL =
        0x1696D1ad6B333c912B1b658f1C48ea975cFD5D26;

    address constant dulplicate_xSQGL_Holder =
        0x92C4317830aF63462064B9b120f9C094Ba428890;

    function setUp() public {
        vm.createSelectFork(vm.envString("MAINNET_RPC_URL"));

        // Set our block ID to a specific, test-suitable number
        vm.rollFork(BLOCK_NUMBER);
        // Confirm that our block number has set successfully
        assertEq(block.number, BLOCK_NUMBER);
    }

    function testXTokenAddrCorrect() public {
        // upgrade proxy
        NFTXInventoryStaking newInventoryStakingImpl = new NFTXInventoryStaking();
        vm.prank(MULTISIG);
        multiProxyController.upgradeProxyTo(
            5,
            address(newInventoryStakingImpl)
        );

        // xSQGL address should match now
        assertEq(inventoryStakingProxy.xTokenAddr(SQGL), xSQGL);
    }

    function testUserCanWithdrawFromDuplicateXToken() public {
        // upgrade to new implementation
        testXTokenAddrCorrect();

        uint256 xTokenBalance = XTokenUpgradeable(duplicate_xSQGL).balanceOf(
            dulplicate_xSQGL_Holder
        );

        uint256 preSQLBalance = IERC20Upgradeable(SQGL).balanceOf(
            dulplicate_xSQGL_Holder
        );

        uint256 timelockUntil = XTokenUpgradeable(duplicate_xSQGL)
            .timelockUntil(dulplicate_xSQGL_Holder);
        // move to the future when timelock ends
        vm.warp(timelockUntil + 1);

        vm.prank(dulplicate_xSQGL_Holder);
        inventoryStakingProxy.directWithdraw(duplicate_xSQGL, xTokenBalance);

        assertGt(
            IERC20Upgradeable(SQGL).balanceOf(dulplicate_xSQGL_Holder),
            preSQLBalance
        );
    }
}
