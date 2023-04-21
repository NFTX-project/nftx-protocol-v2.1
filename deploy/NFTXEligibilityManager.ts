import { HardhatRuntimeEnvironment, Network } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { utils } from "ethers";
import deployConfig from "../deployConfig";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, execute } = deployments;

  const { deployer } = await getNamedAccounts();
  const config = deployConfig[network.name];

  const NFTXEligibilityManager = await deploy("NFTXEligibilityManager", {
    from: deployer,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      viaAdminContract: "MultiProxyController",
      owner: config.MultiProxyControllerOwner, // `owner` of the `adminContract`
      execute: {
        init: {
          methodName: "__NFTXEligibilityManager_init",
          args: [],
        },
      },
    },
    log: true,
  });

  await execute(
    "NFTXVaultFactoryUpgradeable",
    { from: deployer },
    "setEligibilityManager",
    NFTXEligibilityManager.address
  );
};
export default func;
func.tags = ["NFTXEligibilityManager"];
// func.dependencies = ["NFTXVaultFactoryUpgradeable", "MultiProxyController"];
