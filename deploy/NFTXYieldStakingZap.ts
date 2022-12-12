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
  const NFTXInventoryStaking = await deployments.get("NFTXInventoryStaking");
  const NFTXLPStaking = await deployments.get("NFTXLPStaking");

  const NFTXYieldStakingZap = await deploy("NFTXYieldStakingZap", {
    from: deployer,
    args: [
      NFTXVaultFactoryUpgradeable.address,
      NFTXInventoryStaking.address,
      NFTXLPStaking.address,
      config.sushiRouter,
      config.WETH,
      config.swapTarget,
    ],
    log: true,
  });
};
export default func;
func.tags = ["NFTXYieldStakingZap"];
// func.dependencies = [
//   "NFTXVaultFactoryUpgradeable",
//   "NFTXInventoryStaking",
//   "NFTXLPStaking",
// ];
