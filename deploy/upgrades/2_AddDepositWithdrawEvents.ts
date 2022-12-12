import { HardhatRuntimeEnvironment, Network } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { utils } from "ethers";
import { DeployResult } from "hardhat-deploy/types";
import deployConfig from "../../deployConfig";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, execute } = deployments;

  const { deployer } = await getNamedAccounts();
  const config = deployConfig[network.name];

  // @note upgrading will fail here as proxies owned by MultiProxyController
  // so let the following code deploy new implementation (despite error), store it in deployments folder and then upgrade proxy implementation

  try {
    const NFTXLPStaking = await deploy("NFTXLPStaking", {
      from: deployer,
      proxy: {
        proxyContract: "OpenZeppelinTransparentProxy",
      },
      log: true,
    });
  } catch (e) {}

  // upgrade with new implementation
  const NFTXLPStaking = await deployments.get("NFTXLPStaking");
  await execute(
    "MultiProxyController",
    { from: deployer },
    "upgradeProxyTo",
    2,
    NFTXLPStaking.implementation
  );
};
export default func;
func.tags = ["2_AddDepositWithdrawEvents"];
