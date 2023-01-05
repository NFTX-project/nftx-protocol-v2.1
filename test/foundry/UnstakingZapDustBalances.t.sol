// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import 'forge-std/Test.sol';

import '../../contracts/solidity/testing/IERC20.sol';
import {NFTXStakingZap} from '../../contracts/solidity/NFTXStakingZap.sol';
import {NFTXUnstakingInventoryZap} from '../../contracts/solidity/NFTXUnstakingInventoryZap.sol';
import {NFTXStakingZap} from '../../contracts/solidity/NFTXStakingZap.sol';
import {XTokenUpgradeable} from '../../contracts/solidity/token/XTokenUpgradeable.sol';

import {INFTXVault} from '../../contracts/solidity/interface/INFTXVault.sol';


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
 * If this runs through Sushi, it actually works. The issue comes if the zap actually
 * holds a dust token amount. It doesn't appear to use it.
 * 
 * https://app.shortcut.com/nftx/story/719/unstaking-zap-execution-reverted-with-dust-balances
 * https://www.notion.so/nftx/Execution-Reverted-on-Inventory-Unstaking-ca871d36d1894e8ba6af98967e630bea
 */
contract UnstakingZapDustBalances is Test {

    /// Store our mainnet fork information
    uint mainnetFork;
    uint internal constant BLOCK_NUMBER = 16_189_167;

    address internal constant PUNK_HOLDER = 0xA858DDc0445d8131daC4d1DE01f834ffcbA52Ef1;
    address internal constant PUNK_TOKEN = 0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB;

    // Our PUNK vault
    uint internal constant VAULT_ID = 0;
    address internal constant VAULT_ADDR = 0x269616D549D7e8Eaa82DFb17028d0B212D11232A;
    address internal constant VAULT_XTOKEN = 0x08765C76C758Da951DC73D3a8863B34752Dd76FB;

    // Our zaps
    address payable internal constant STAKING_ZAP = payable(0xdC774D5260ec66e5DD4627E1DD800Eff3911345C);
    address payable internal constant UNSTAKING_ZAP = payable(0x51d660Ba5c218b2Cf33FBAcA5e3aBb8aEff3543B);

    constructor () {
        // Generate a mainnet fork
        mainnetFork = vm.createFork(vm.envString('MAINNET_RPC_URL'));

        // Select our fork for the VM
        vm.selectFork(mainnetFork);

        // Set our block ID to a specific, test-suitable number
        vm.rollFork(BLOCK_NUMBER);

        // Confirm that our block number has set successfully
        assertEq(block.number, BLOCK_NUMBER);
    }

    /**
     * TODO:
     *
     * - Deploy the local Staking and Unstaking zap so we can modify
     */
    function test_CanTriggerIssue(uint amount) public {
        uint[] memory tokenIds = new uint[](8);
        tokenIds[0] = 3;
        tokenIds[1] = 4;
        tokenIds[2] = 5;
        tokenIds[3] = 6;
        tokenIds[4] = 7;
        tokenIds[5] = 8;
        tokenIds[6] = 9;
        tokenIds[7] = 10;

        vm.assume(amount > 0 && amount <= tokenIds.length);

        // Connect to our user to mock future calls as their wallet
        vm.startPrank(PUNK_HOLDER);

        uint[] memory selectedTokenIds = new uint[](amount);
        for (uint i; i < amount;) {
            selectedTokenIds[i] = tokenIds[i];

            // Approve the token to be traded
            bytes memory data = abi.encodeWithSignature("offerPunkForSaleToAddress(uint256,uint256,address)", selectedTokenIds[i], 0, STAKING_ZAP);
            (bool success, bytes memory resultData) = address(PUNK_TOKEN).call(data);
            require(success, string(resultData));

            unchecked { ++i; }
        }

        // Deposit (1 or more) tokens into a vault using the NFTXStakingZap.sol
        NFTXStakingZap(STAKING_ZAP).provideInventory721(VAULT_ID, selectedTokenIds);

        // Get our new xToken balance
        uint xTokenBalance = IERC20(VAULT_XTOKEN).balanceOf(PUNK_HOLDER);

        // See how much comes back
        console.log('Returned xToken:');
        console.log(xTokenBalance);

        // Skip over days to remove timelock with no activity
        vm.warp(block.timestamp + 10 days);

        // Find the number of available NFTs based on the held xToken, as well as if we
        // are `shortByTinyAmount`, which may (I believe) flag the 1 wei issue will occur??
        //
        // This function is not commented and seems a bit mental.
        (uint numNfts, bool shortByTinyAmount) = NFTXUnstakingInventoryZap(UNSTAKING_ZAP).maxNftsUsingXToken(
            VAULT_ID, PUNK_HOLDER, VAULT_XTOKEN
        );

        assertEq(numNfts, amount);
        assertEq(shortByTinyAmount, true);

        // Approve the unstaking zap to handle our xToken
        IERC20(VAULT_XTOKEN).approve(UNSTAKING_ZAP, xTokenBalance);

        // This will assert our updated calculation based on received xTokens
         determineBurnXTokenValue(xTokenBalance);

        NFTXUnstakingInventoryZap(UNSTAKING_ZAP).unstakeInventory(
            VAULT_ID,
            amount,
            0  // remainingPortionToUnstake
        );

        assertEq(IERC20(VAULT_ADDR).balanceOf(PUNK_HOLDER), amount * 1e18);

        vm.stopPrank();
    }

    function determineBurnXTokenValue(uint _share) internal {
        /**
         * This approach should remove the requirement for this:
         * ```
         * // check for rounding error
         * if ((reqXTokens * shareValue) / 1e18 < numNfts * 1e18) {
         *      reqXTokens += 1;
         * }
         * ```
         */

        XTokenUpgradeable xToken = XTokenUpgradeable(VAULT_XTOKEN);

        // Gets the amount of xToken in existence and amount of base token held
        uint totalShares = xToken.totalSupply();
        uint xTokenBaseBalance = IERC20(VAULT_ADDR).balanceOf(address(VAULT_XTOKEN));

        // Calculates the amount of base tokens the xToken is worth
        uint256 what = ceil((_share * xTokenBaseBalance) / totalShares, 1e18);
        assertEq(what, 1000000000000000000);
    }

    function ceil(uint a, uint m) internal pure returns (uint) {
        return ((a + m - 1) / m) * m;
    }

}
