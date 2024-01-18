import * as fs from "fs";

// Define the path of your files
const jsonFilePath = "./addresses.json";
const baseMarkdownFilePath = "./script/base-README.md";
const outputMarkdownFilePath = "./README.md";

const baseExplorerURLs = {
  arbitrum: "https://arbiscan.io/address/",
  mainnet: "https://etherscan.io/address/",
  sepolia: "https://sepolia.etherscan.io/address/",
  goerli: "https://goerli.etherscan.io/address/",
};

// URLs for each contract
const contractURLs = {
  MultiProxyController: "./contracts/solidity/proxy/MultiProxyController.sol",
  NFTXEligibilityManager: "./contracts/solidity/NFTXEligibilityManager.sol",
  NFTXInventoryStaking: "./contracts/solidity/NFTXInventoryStaking.sol",
  NFTXLPStaking: "./contracts/solidity/NFTXLPStaking.sol",
  NFTXMarketplace0xZap: "./contracts/solidity/NFTXMarketplace0xZap.sol",
  NFTXSimpleFeeDistributor: "./contracts/solidity/NFTXSimpleFeeDistributor.sol",
  NFTXStakingZap: "./contracts/solidity/NFTXStakingZap.sol",
  NFTXUnstakingInventoryZap:
    "./contracts/solidity/NFTXUnstakingInventoryZap.sol",
  NFTXVaultCreationZap: "./contracts/solidity/zaps/NFTXVaultCreationZap.sol",
  NFTXVaultFactoryUpgradeable:
    "./contracts/solidity/NFTXVaultFactoryUpgradeable.sol",
  StakingTokenProvider: "./contracts/solidity/StakingTokenProvider.sol",
  sushiRouter:
    "https://vscode.blockscan.com/ethereum/0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
  swapTarget:
    "https://vscode.blockscan.com/ethereum/0xDef1C0ded9bec7F1a1670819833240f027b25EfF",
  TimelockExcludeList: "./contracts/solidity/other/TimelockExcludeList.sol",
  uniLikeExchange:
    "https://vscode.blockscan.com/ethereum/0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac",
  WETH: "https://vscode.blockscan.com/ethereum/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
};

// Function to generate markdown table
function generateMarkdownTable(data: any): string {
  const networks = Object.keys(data);
  const contracts = Array.from(
    new Set(networks.flatMap((network) => Object.keys(data[network])))
  );

  // Prepare headers
  const headerRow = ["Contract", ...networks].join(" | ");
  const separatorRow = ["---", ...networks.map(() => "---")].join(" | ");

  // Prepare rows
  const rows = contracts.map((contract) => {
    const contractLink = contractURLs[contract]
      ? `[${contract}](${contractURLs[contract]})`
      : contract;
    const row = networks.map((network) => {
      const address = data[network][contract];
      return address
        ? `[${address}](${baseExplorerURLs[network] + address + "#code"})`
        : "N/A";
    });
    return [contractLink, ...row].join(" | ");
  });

  return [headerRow, separatorRow, ...rows].join("\n");
}

// Function to replace placeholder in base markdown with table
function replacePlaceholderWithTable(
  baseContent: string,
  table: string
): string {
  return baseContent.replace("[addresses-table]", table);
}

// Read JSON file and generate markdown table
fs.readFile(jsonFilePath, { encoding: "utf8" }, (err, jsonString) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  try {
    const data = JSON.parse(jsonString);
    const markdownTable = generateMarkdownTable(data);

    // Read the base markdown file
    fs.readFile(
      baseMarkdownFilePath,
      { encoding: "utf8" },
      (err, baseContent) => {
        if (err) {
          console.error("Error reading base markdown file:", err);
          return;
        }

        // Replace the placeholder with the table
        const outputContent = replacePlaceholderWithTable(
          baseContent,
          markdownTable
        );

        // Write the output to a new markdown file
        fs.writeFile(outputMarkdownFilePath, outputContent, (err) => {
          if (err) {
            console.error("Error writing output markdown file:", err);
          } else {
            console.log(
              `Output markdown created successfully at ${outputMarkdownFilePath}`
            );
          }
        });
      }
    );
  } catch (err) {
    console.error("Error parsing JSON string:", err);
  }
});
