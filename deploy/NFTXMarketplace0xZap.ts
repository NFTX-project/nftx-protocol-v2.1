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

  const NFTXMarketplace0xZap = await deploy("NFTXMarketplace0xZap", {
    from: deployer,
    args: [NFTXVaultFactoryUpgradeable.address, config.WETH, config.swapTarget],
    log: true,
  });
};
export default func;
func.tags = ["NFTXMarketplace0xZap"];
// func.dependencies = ["NFTXVaultFactoryUpgradeable"];
