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

  const NFTXUnstakingInventoryZap = await deploy("NFTXUnstakingInventoryZap", {
    from: deployer,
    log: true,
  });
  // set values
  await execute(
    "NFTXUnstakingInventoryZap",
    { from: deployer },
    "setVaultFactory",
    NFTXVaultFactoryUpgradeable.address
  );
  await execute(
    "NFTXUnstakingInventoryZap",
    { from: deployer },
    "setInventoryStaking",
    NFTXInventoryStaking.address
  );

  // configure other contracts
  await execute(
    "NFTXVaultFactoryUpgradeable",
    { from: deployer },
    "setFeeExclusion",
    NFTXUnstakingInventoryZap.address,
    true
  );
};
export default func;
func.tags = ["NFTXUnstakingInventoryZap"];
// func.dependencies = ["NFTXVaultFactoryUpgradeable", "NFTXInventoryStaking"];
