import { HardhatRuntimeEnvironment, Network } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { utils } from "ethers";
import deployConfig from "../../deployConfig";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, execute } = deployments;

  const { deployer } = await getNamedAccounts();
  const config = deployConfig[network.name];

  // get all the proxies
  const NFTXVaultFactoryUpgradeable = await deployments.get(
    "NFTXVaultFactoryUpgradeable"
  );
  const NFTXSimpleFeeDistributor = await deployments.get(
    "NFTXSimpleFeeDistributor"
  );
  const NFTXLPStaking = await deployments.get("NFTXLPStaking");
  const StakingTokenProvider = await deployments.get("StakingTokenProvider");
  const NFTXEligibilityManager = await deployments.get(
    "NFTXEligibilityManager"
  );
  const NFTXInventoryStaking = await deployments.get("NFTXInventoryStaking");

  // deploy MultiProxyController
  const MultiProxyController = await deploy("MultiProxyController", {
    from: deployer,
    args: [
      [
        "NFTX Factory",
        "Fee Distributor",
        "LP Staking",
        "StakingTokenProvider",
        "Eligibility Manager",
        "Inventory Staking",
      ],
      [
        NFTXVaultFactoryUpgradeable.address,
        NFTXSimpleFeeDistributor.address,
        NFTXLPStaking.address,
        StakingTokenProvider.address,
        NFTXEligibilityManager.address,
        NFTXInventoryStaking.address,
      ],
    ],
    log: true,
  });

  // transfer ownership of all proxies to MultiProxyController
  await execute(
    "DefaultProxyAdmin",
    { from: deployer },
    "changeProxyAdmin",
    NFTXVaultFactoryUpgradeable.address,
    MultiProxyController.address
  );
  await execute(
    "DefaultProxyAdmin",
    { from: deployer },
    "changeProxyAdmin",
    NFTXSimpleFeeDistributor.address,
    MultiProxyController.address
  );
  await execute(
    "DefaultProxyAdmin",
    { from: deployer },
    "changeProxyAdmin",
    NFTXLPStaking.address,
    MultiProxyController.address
  );
  await execute(
    "DefaultProxyAdmin",
    { from: deployer },
    "changeProxyAdmin",
    StakingTokenProvider.address,
    MultiProxyController.address
  );
  await execute(
    "DefaultProxyAdmin",
    { from: deployer },
    "changeProxyAdmin",
    NFTXEligibilityManager.address,
    MultiProxyController.address
  );
  await execute(
    "DefaultProxyAdmin",
    { from: deployer },
    "changeProxyAdmin",
    NFTXInventoryStaking.address,
    MultiProxyController.address
  );
};
export default func;
func.tags = ["0_MultiProxyController"];
func.dependencies = [
  "NFTXVaultFactoryUpgradeable",
  "NFTXSimpleFeeDistributor",
  "NFTXLPStaking",
  "StakingTokenProvider",
  "NFTXEligibilityManager",
  "NFTXInventoryStaking",
];
