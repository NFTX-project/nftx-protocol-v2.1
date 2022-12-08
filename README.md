# NFTX Protocol v2

## Setup

`pnpm i`

Create `.env` file by referencing `.env.sample`.

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

5. Verify deployed contracts on Etherscan

   `pnpm verify:goerli`
