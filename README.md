# NFTX Protocol v2

## Setup

`pnpm i`

Create `.env` file by referencing `.env.sample`.

Installing foundry:

1. `curl -L https://foundry.paradigm.xyz | bash`
2. `foundryup`

## Scripts

1. Compile contracts and create their Typescript bindings.

   `pnpm compile`

2. Run tests

   `pnpm test`

3. Deploy to local hardhat node

   `pnpm deploy:default`  
   Note: If you want to force deploy again, add `--reset` flag

4. Deploy to Goerli

   `pnpm deploy:goerli`

**Note:** To only run a single deploy file run: `pnpm deploy:goerli --tags <tag>`\
Tags are defined in the deploy script at the end like: `func.tags = ["<tag>"]`

5. Verify deployed contracts on Etherscan

   `pnpm verify:goerli`

## Info

Contracts should be deployed in the following order:

1. StakingTokenProvider
2. NFTXLPStaking
3. NFTXSimpleFeeDistributor
4. NFTXVaultFactoryUpgradeable
5. NFTXInventoryStaking
6. NFTXEligibilityManager
7. MultiProxyController
8. NFTXStakingZap, NFTXUnstakingInventoryZap, TimelockExcludeList, NFTXMarketplaceZap
