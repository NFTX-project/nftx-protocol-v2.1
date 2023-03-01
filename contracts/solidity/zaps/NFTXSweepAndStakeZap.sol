// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {console} from "forge-std/console.sol";

import {IERC20} from '../testing/IERC20.sol';
import {IERC721} from '../testing/IERC721.sol';
import {IERC721Receiver} from '../testing/IERC721Receiver.sol';
import {INFTXVault} from '../interface/INFTXVault.sol';
import {NFTXStakingZap} from '../NFTXStakingZap.sol';
import {Ownable} from '../util/Ownable.sol';
import {Pausable} from '../util/Pausable.sol';


/**
 * @notice Allows sweeping from Gem.xyz to facilitate the purchasing and immediate
 * staking of ERC721s.
 *
 * @author Twade
 */
contract SweepAndStakeZap is IERC721Receiver, Ownable, Pausable {

    NFTXStakingZap staking;

    /// Internal store of GemSwap contract
    address gemSwap;

    /// @notice Emitted when ..
    event Sweep(uint ethAmount);

    function sweepAndStake(
        address vault,
        uint sweepAmount,
        uint[] calldata expectedTokenIds,
        uint liquidityAmount,
        bytes memory txData
    ) external payable whenNotPaused {
        require(sweepAmount <= msg.value, 'A');
        require(sweepAmount + liquidityAmount <= msg.value);

        INFTXVault vault = INFTXVault(vault);
        require(vault.allowAllItems(), 'C');

        // Get the amount of ETH we started with
        uint startBalance = address(this).balance;

        console.log('PRE SWEEP');

        // Sweeps from GemSwap
        (bool success, ) = payable(gemSwap).call{value: msg.value}(txData);
        require(success, 'D');

        // The sender will receive the NFTs transferred, but they should be
        // pre-approved and we can transfer them in.
        for (uint i; i < expectedTokenIds.length;) {
            // TODO: Do we want to check that we got the tokens, or just fail?
            IERC721(vault.assetAddress()).transferFrom(msg.sender, address(this), expectedTokenIds[i]);
            unchecked { ++i; }
        }

        IERC721(vault.assetAddress()).setApprovalForAll(address(staking), true);

        console.log('POST SWEEP');

        // TODO: NEEDS TO BE EXCLUDED FROM TIMELOCK IN THE TEST

        require(expectedTokenIds.length != 0, 'X');

        // If we have liquidity, stake into LP
        if (liquidityAmount != 0) {
            staking.addLiquidity721ETHTo(vault.vaultId(), expectedTokenIds, liquidityAmount, msg.sender);
        }
        // Otherwise, we stake into Inventory
        else {
            // Stake xToken balance
            uint startXTokenBalance = IERC20(address(vault)).balanceOf(address(this));

            // Provide inventory
            staking.provideInventory721(vault.vaultId(), expectedTokenIds);

            // Transfer xToken to the sender
            IERC20(address(vault)).transfer(msg.sender, IERC20(address(vault)).balanceOf(address(this)) - startXTokenBalance);
        }

        // Emit the amount of ETH used to sweep
        uint spent = startBalance - address(this).balance;
        emit Sweep(spent);

        // Return any remaining ETH
        payable(msg.sender).transfer(msg.value - spent - liquidityAmount);
    }

    /**
     * Allows the owner to add a whitelisted address that can be passed as a
     * `target` in the `sweepAndStake` function. This can be either activated
     * or deactivated based on the `_value` passed.
     */
    function setGemSwap(address _gemSwap) external onlyOwner {
        gemSwap = _gemSwap;
    }

    /**
     * ..
     */
    function setStakingContracts(address payable _staking) external onlyOwner {
        staking = NFTXStakingZap(_staking);
    }

    /**
     * ..
     */
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    /**
     * ..
     */
    receive() external payable {
        //
    }

}
