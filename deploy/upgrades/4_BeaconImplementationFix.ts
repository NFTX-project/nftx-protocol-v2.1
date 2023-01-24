import { HardhatRuntimeEnvironment, Network } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { utils } from "ethers";
import { promises as fs } from "fs";
import path from "path";
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
      },
      log: true,
    });
  } catch (e) {}

  const NFTXVaultFactoryUpgradeable_Implementation = JSON.parse(
    await fs.readFile(
      path.join(
        __dirname,
        `../../deployments/${network.name}/NFTXVaultFactoryUpgradeable_Implementation.json`
      ),
      "utf8"
    )
  );

  await execute(
    "MultiProxyController",
    { from: deployer },
    "upgradeProxyTo",
    0,
    NFTXVaultFactoryUpgradeable_Implementation.address
  );
};
export default func;
func.tags = ["4_BeaconImplementationFix"];
