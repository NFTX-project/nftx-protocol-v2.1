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

  const NFTXInventoryStaking = await deploy("NFTXInventoryStaking", {
    from: deployer,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        init: {
          methodName: "__NFTXInventoryStaking_init",
          args: [NFTXVaultFactoryUpgradeable.address],
        },
      },
    },
    log: true,
  });

  // set values
  await execute(
    "NFTXInventoryStaking",
    { from: deployer },
    "setInventoryLockTimeErc20",
    800
  );

  // set address in other contracts
  await execute(
    "NFTXSimpleFeeDistributor",
    { from: deployer },
    "setInventoryStakingAddress",
    NFTXInventoryStaking.address
  );
  await execute(
    "NFTXSimpleFeeDistributor",
    { from: deployer },
    "addReceiver",
    "200000000000000000",
    NFTXInventoryStaking.address,
    true
  );
};
export default func;
func.tags = ["NFTXInventoryStaking"];
func.dependencies = ["NFTXVaultFactoryUpgradeable", "NFTXSimpleFeeDistributor"];
