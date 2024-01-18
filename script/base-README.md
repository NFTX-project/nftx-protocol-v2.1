# NFTX Protocol v2

## Contracts

[addresses-table]

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

**Notes:**

i. To only run a single deploy file run: `pnpm deploy:goerli --tags <tag>`\
Tags are defined in the deploy script at the end like: `func.tags = ["<tag>"]`

ii. By default deploy uses Legacy transactions which is not ideal. So specify the EIP-1559 gas params when calling like this:\
`pnpm deploy:mainnet --tags <tag> --maxfee <inWei> --priorityfee <inWei>`

iii. If need to deploy new implementation for a proxy which doesn't exist in the deployments folder:

- Create `ContractName.json` with `address`
- Create `ContractName_Proxy.json` with `address` & `transactionHash`
- Make sure `MultiProxyController.json` exists with `abi` and `transactionHash`
- `ContractName_Implementation.json` would then get deployed via script, but it'll fail to upgrade the proxy as `MultiProxyController` is owned by multisig (so do that manually).

5. Verify deployed contracts on Etherscan

   `pnpm verify:goerli`

**Note:** If getting "Invalid API Key" error for arbiscan, etc. Execute like this: `source .env && pnpm verify:arbitrum --api-key $ARBISCAN_API_KEY`

## Info

Contracts should be deployed in the following order:

1. MultiProxyController
2. StakingTokenProvider
3. NFTXLPStaking
4. NFTXSimpleFeeDistributor
5. NFTXVaultFactoryUpgradeable
6. NFTXInventoryStaking
7. NFTXEligibilityManager
8. NFTXStakingZap, NFTXUnstakingInventoryZap, TimelockExcludeList, NFTXMarketplace0xZap, NFTXVaultCreationZap
