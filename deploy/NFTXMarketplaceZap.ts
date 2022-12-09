import { HardhatRuntimeEnvironment, Network } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { utils } from "ethers";
import deployConfig from "../deployConfig";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, execute } = deployments;

  const { deployer } = await getNamedAccounts();
  const config = deployConfig[network.name];

  const NFTXVaultFactoryUpgradeable = await deployments.get(
    "NFTXVaultFactoryUpgradeable"
  );

  const NFTXMarketplaceZap = await deploy("NFTXMarketplaceZap", {
    from: deployer,
    args: [NFTXVaultFactoryUpgradeable.address, config.sushiRouter],
    log: true,
  });
};
export default func;
func.tags = ["NFTXStakingZap"];
func.dependencies = ["NFTXVaultFactoryUpgradeable"];
