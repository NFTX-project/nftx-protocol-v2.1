import { HardhatRuntimeEnvironment, Network } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { utils } from "ethers";
import { promises as fs } from "fs";
import path from "path";
import { setImplementation } from "../../helpers";
import deployConfig from "../../deployConfig";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, execute } = deployments;

  const { deployer } = await getNamedAccounts();
  const config = deployConfig[network.name];

  // @note upgrading will fail here as proxies owned by MultiProxyController
  // so let the following code deploy new implementation (despite error), store it in deployments folder and then upgrade proxy implementation

  try {
    await deploy("NFTXVaultFactoryUpgradeable", {
      from: deployer,
      proxy: {
        proxyContract: "OpenZeppelinTransparentProxy",
        viaAdminContract: "MultiProxyController",
        owner: config.MultiProxyControllerOwner, // `owner` of the `adminContract`
      },
      log: true,
    });
  } catch (e) {}

  const NFTXVaultFactoryUpgradeable_Implementation = await setImplementation(
    "NFTXVaultFactoryUpgradeable",
    network
  );

  // await execute(
  //   "MultiProxyController",
  //   { from: deployer },
  //   "upgradeProxyTo",
  //   0,
  //   NFTXVaultFactoryUpgradeable_Implementation.address
  // );
};
export default func;
func.tags = ["5_BeaconImplementationFix"];
