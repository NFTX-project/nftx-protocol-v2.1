import { HardhatRuntimeEnvironment, Network } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { utils } from "ethers";
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
    const NFTXInventoryStaking = await deploy("NFTXInventoryStaking", {
      from: deployer,
      proxy: {
        proxyContract: "OpenZeppelinTransparentProxy",
        viaAdminContract: "MultiProxyController",
        owner: config.MultiProxyControllerOwner, // `owner` of the `adminContract`
      },
      log: true,
    });
  } catch (e) {}

  // not using deployments.get() for implementations here as it returns `undefined` if we had just modified the deployments json file.
  const NFTXInventoryStaking_Implementation = await setImplementation(
    "NFTXInventoryStaking",
    network
  );

  // await execute(
  //   "MultiProxyController",
  //   { from: deployer },
  //   "upgradeProxyTo",
  //   5,
  //   NFTXInventoryStaking_Implementation
  // );
};
export default func;
func.tags = ["4_FixXTokenAddress"];
