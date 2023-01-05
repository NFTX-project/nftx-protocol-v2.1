// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./util/Ownable.sol";
import "./util/ReentrancyGuard.sol";
import "./util/SafeERC20Upgradeable.sol";
import "./interface/INFTXVaultFactory.sol";
import "./interface/INFTXVault.sol";
import "./interface/IUniswapV2Router01.sol";
import "./token/IWETH.sol";
import "./NFTXInventoryStaking.sol";

contract NFTXUnstakingInventoryZap is Ownable, ReentrancyGuard {
    using SafeERC20Upgradeable for IERC20Upgradeable;

    INFTXVaultFactory public vaultFactory;
    NFTXInventoryStaking public inventoryStaking;
    IUniswapV2Router01 public sushiRouter;
    IWETH public weth;

    event InventoryUnstaked(
        uint256 vaultId,
        uint256 xTokensUnstaked,
        uint256 numNftsRedeemed,
        address unstaker
    );

    function setVaultFactory(address addr) public onlyOwner {
        vaultFactory = INFTXVaultFactory(addr);
    }

    function setInventoryStaking(address addr) public onlyOwner {
        inventoryStaking = NFTXInventoryStaking(addr);
    }

    function setSushiRouterAndWeth(address sushiRouterAddr) public onlyOwner {
        sushiRouter = IUniswapV2Router01(sushiRouterAddr);
        weth = IWETH(sushiRouter.WETH());
    }
    
    function unstakeInventory(
        uint256 vaultId,
        uint256 numNfts,
        uint256 remainingPortionToUnstake // TODO: add what this param is for in comments
    ) public payable {
        require(remainingPortionToUnstake <= 10e17); // TODO: replace with 1e18
        address vTokenAddr = vaultFactory.vault(vaultId);
        address xTokenAddr = inventoryStaking.xTokenAddr(vTokenAddr);
        IERC20Upgradeable vToken = IERC20Upgradeable(vTokenAddr); // TODO: directly declare IERC20 above to save gas
        IERC20Upgradeable xToken = IERC20Upgradeable(xTokenAddr);

        // calculate xTokensToPull to pull
        uint256 xTokensToPull;
        if (remainingPortionToUnstake == 10e17) { // TODO: replace with 1e18
            xTokensToPull = xToken.balanceOf(msg.sender);
        } else {
            uint256 shareValue = inventoryStaking.xTokenShareValue(vaultId);
            uint256 reqXTokens = ((numNfts * 10e17) * 10e17) / shareValue; // TODO: replace with 1e18

            // Check for rounding error being 1 less that expected amount
            if ((reqXTokens * shareValue) / 10e17 < numNfts * 10e17) { // TODO: replace with 1e18
                reqXTokens += 1;
            }

            // If the user doesn't have enough xTokens then we just want to pull the
            // balance of the user.
            if (xToken.balanceOf(msg.sender) < reqXTokens) { // TODO: cache xToken.balanceOf(msg.sender)
                xTokensToPull = xToken.balanceOf(msg.sender);
            }
            // If we have a zero portion to unstake, then we need to pull all tokens
            // that are required.
            else if (remainingPortionToUnstake == 0) {
                xTokensToPull = reqXTokens;
            }
            // Otherwise, we do some math that I don't quite understand. // TODO: edit this comment lol
            else {
                uint256 remainingXTokens = xToken.balanceOf(msg.sender) - reqXTokens;
                xTokensToPull =
                    reqXTokens +
                    ((remainingXTokens * remainingPortionToUnstake) / 10e17);
            }
        }

        // pull xTokens then unstake for vTokens
        xToken.safeTransferFrom(msg.sender, address(this), xTokensToPull);

        // If our inventory staking contract has an allowance less that the amount we need
        // to pull, then we need to approve additional tokens.
        if (xToken.allowance(address(this), address(inventoryStaking)) < xTokensToPull) {
            xToken.approve(address(inventoryStaking), type(uint256).max);
        }

        uint256 initialVTokenBal = vToken.balanceOf(address(this));

        // Burn our xTokens to pull in our vTokens
        inventoryStaking.withdraw(vaultId, xTokensToPull);

        uint256 missingVToken;

        // If the amount of vTokens generated from our `inventoryStaking.withdraw` call
        // is not sufficient to fulfill the claim on the specified number of NFTs, then
        // we determine if we can claim some dust from the contract.
        if (vToken.balanceOf(address(this)) - initialVTokenBal < numNfts * 10e17) { // TODO: replace with 1e18
            // We can calculate the amount of vToken required by the contract to get
            // it from the withdrawal amount to the amount required based on the number
            // of NFTs.
            missingVToken =
                (numNfts * 10e17) - // TODO: cache this value
                (vToken.balanceOf(address(this)) - initialVTokenBal); // TODO: cache this value

            /**
             * (numNfts * 10e17) = 1e18
             * initialVTokenBal = 2
             * vToken.balanceOf(address(this)) = 1000000000000000001
             * 
             * 1000000000000000000 - (1000000000000000001 - 2) = 1
             */
        }

        // This dust value has to be less that 100 to ensure we aren't just being rinsed
        // of dust.
        require(missingVToken < 100, "not enough vTokens");

        if (missingVToken > initialVTokenBal) {
            // If user has sufficient vTokens to account for missingVToken
            // then get it from them to this contract
            if (
                vToken.balanceOf(msg.sender) >= missingVToken &&
                vToken.allowance(address(this), vTokenAddr) >= missingVToken // FIXME: should check allowance as: vToken.allowance(msg.sender, address(this))
            ) {
                vToken.safeTransferFrom(
                    msg.sender,
                    address(this),
                    missingVToken
                );
            } else {
                // else we swap ETH from this contract to some vTokens
                // FIXME: extra vTokens that we get here shouldn't be sent to msg.sender as vTokenRemainder
                address[] memory path = new address[](2);
                path[0] = address(weth);
                path[1] = vTokenAddr;
                sushiRouter.swapETHForExactTokens{value: 1_000_000_000}(
                    missingVToken,
                    path,
                    address(this),
                    block.timestamp + 10000 // TODO: remove unnecessary 10000
                );
            }
        }

        // reedem NFTs with vTokens, if requested
        if (numNfts > 0) {
            // FIXME: approval to vTokenAddr is not required in order to call `redeemTo`
            if (vToken.allowance(address(this), vTokenAddr) < numNfts * 10e17) {
                vToken.approve(vTokenAddr, type(uint256).max);
            }
            INFTXVault(vTokenAddr).redeemTo(
                numNfts,
                new uint256[](0),
                msg.sender
            );
        }

        // FIXME: WARNING: If the contract has less vToken that it started with then this could
        // create an underflow error, right? This would mean that we would need a conditional
        // to wrap around this to ensure that the vToken balance is greater than the
        // `initialVTokenBal`.
        uint256 vTokenRemainder = vToken.balanceOf(address(this)) - initialVTokenBal;

        // if vToken remainder more than dust then return to sender
        if (vTokenRemainder > 100) {
            vToken.safeTransfer(msg.sender, vTokenRemainder);
        }

        emit InventoryUnstaked(vaultId, xTokensToPull, numNfts, msg.sender);
    }

    function maxNftsUsingXToken(
        uint256 vaultId,
        address staker,
        address slpToken
    ) public view returns (uint256 numNfts, bool shortByTinyAmount) {
        if (inventoryStaking.timelockUntil(vaultId, staker) > block.timestamp) {
            return (0, false);
        }
        address vTokenAddr = vaultFactory.vault(vaultId);
        address xTokenAddr = inventoryStaking.xTokenAddr(vTokenAddr);
        IERC20Upgradeable vToken = IERC20Upgradeable(vTokenAddr);
        IERC20Upgradeable xToken = IERC20Upgradeable(xTokenAddr);
        IERC20Upgradeable lpPair = IERC20Upgradeable(slpToken);

        uint256 xTokenBal = xToken.balanceOf(staker);
        uint256 shareValue = inventoryStaking.xTokenShareValue(vaultId);
        uint256 vTokensA = (xTokenBal * shareValue) / 10e17;
        uint256 vTokensB = ((xTokenBal * shareValue) / 10e17) + 99;

        uint256 vTokensIntA = vTokensA / 10e17;
        uint256 vTokensIntB = vTokensB / 10e17;

        if (vTokensIntB > vTokensIntA) {
            if (
                vToken.balanceOf(msg.sender) >= 99 &&
                vToken.allowance(address(this), vTokenAddr) >= 99
            ) {
                return (vTokensIntB, true);
            } else if (lpPair.totalSupply() >= 10000) {
                return (vTokensIntB, true);
            } else if (vToken.balanceOf(address(this)) >= 99) {
                return (vTokensIntB, true);
            } else {
                return (vTokensIntA, false);
            }
        } else {
            return (vTokensIntA, false);
        }
    }

    receive() external payable {}

    function rescue(address token) external onlyOwner {
        if (token == address(0)) {
            (bool success, ) = payable(msg.sender).call{
                value: address(this).balance
            }("");
            require(
                success,
                "Address: unable to send value, recipient may have reverted"
            );
        } else {
            IERC20Upgradeable(token).safeTransfer(
                msg.sender,
                IERC20Upgradeable(token).balanceOf(address(this))
            );
        }
    }
}
