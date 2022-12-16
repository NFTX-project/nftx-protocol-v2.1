// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import 'forge-std/Test.sol';

import "../../contracts/solidity/util/SafeERC20.sol";
import '../../contracts/solidity/NFTXUnstakingInventoryZap.sol';


/**
 * We are seeing users that are trying to unstaking inventory (unstaking to NFTs) are
 * getting execution reverted under certain circumstances.
 * 
 * So far it seems like the issue occurs when...
 * 
 * - The amount of vTokens in the underlying xToken staked amount is 1wei short... this
 *   has been seen with 0.99999999999 tokens and with 7.9999999999 tokens.
 * - There has been no activity on the vault since the user staked their position (i.e.
 *   the remain 1wei short, any fee generating activity will provide them enough tokens
 *   to exit with all their NFTs plus dust token amounts in change)
 * - There is an amount of the vToken sitting in the Unstaking Inventory Zap
 * 
 * https://app.shortcut.com/nftx/story/719/unstaking-zap-execution-reverted-with-dust-balances
 * https://www.notion.so/nftx/Execution-Reverted-on-Inventory-Unstaking-ca871d36d1894e8ba6af98967e630bea
 */
contract UnstakingZapDustBalances is Test {

    using SafeERC20 for IERC20;

    /// Store our mainnet fork information
    uint mainnetFork;
    uint internal constant BLOCK_NUMBER = 16_189_167;

    address internal constant AFFECTED_USER = 0x82cA345C167BDCAd56FbedC7cc85a488885BDAdc;
    uint internal constant VAULT_ID = 1;
    address internal constant VAULT_TOKEN = 0xfC0247CdAAbC166423915077b666FA3bB9d1ee4d;
    address internal constant VAULT_XTOKEN = 0x8217772e6FE703F18C5C08ea04aB962395F62Aa6;
    address payable internal constant UNSTAKING_ZAP = payable(0x51d660Ba5c218b2Cf33FBAcA5e3aBb8aEff3543B);

    function setUp() public {
        // Generate a mainnet fork
        mainnetFork = vm.createFork(vm.envString('MAINNET_RPC_URL'));

        // Select our fork for the VM
        vm.selectFork(mainnetFork);

        // Set our block ID to a specific, test-suitable number
        vm.rollFork(BLOCK_NUMBER);

        // Confirm that our block number has set successfully
        assertEq(block.number, BLOCK_NUMBER);
    }

    function test_CanTriggerIssue() public {
        // Confirm the expected balances held by target wallets
        assertEq(IERC20(VAULT_TOKEN).balanceOf(AFFECTED_USER), 0);
        assertEq(IERC20(VAULT_TOKEN).balanceOf(UNSTAKING_ZAP), 0);

        assertEq(IERC20(VAULT_XTOKEN).balanceOf(AFFECTED_USER), 879535037719212456);
        assertEq(IERC20(VAULT_XTOKEN).balanceOf(UNSTAKING_ZAP), 0);

        // Connect to our affect user to mock future calls as their wallet
        vm.startPrank(AFFECTED_USER);

        // Find the number of available NFTs based on the held xToken, as well as if we
        // are `shortByTinyAmount`, which (I believe) flags the 1 wei issue
        (uint numNfts, bool shortByTinyAmount) = NFTXUnstakingInventoryZap(UNSTAKING_ZAP).maxNftsUsingXToken(
            VAULT_ID,
            AFFECTED_USER,
            VAULT_XTOKEN
        );

        assertEq(numNfts, 2);
        assertEq(shortByTinyAmount, true);

        // Attempt to unstake our inventory
        NFTXUnstakingInventoryZap(UNSTAKING_ZAP).unstakeInventory(
            VAULT_ID,
            numNfts,
            0  // remainingPortionToUnstake
        );

        vm.stopPrank();
    }

}
