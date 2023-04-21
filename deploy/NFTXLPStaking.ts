import { HardhatRuntimeEnvironment, Network } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { utils } from "ethers";
import deployConfig from "../deployConfig";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, execute } = deployments;

  const { deployer } = await getNamedAccounts();
  const config = deployConfig[network.name];

  const StakingTokenProvider = await deployments.get("StakingTokenProvider");

  try {
    const NFTXLPStaking = await deploy("NFTXLPStaking", {
      from: deployer,
      proxy: {
        proxyContract: "OpenZeppelinTransparentProxy",
        viaAdminContract: "MultiProxyController",
        owner: config.MultiProxyControllerOwner, // `owner` of the `adminContract`
        execute: {
          init: {
            methodName: "__NFTXLPStaking__init",
            args: [StakingTokenProvider.address],
          },
        },
      },
      log: true,
    });
  } catch (e) {
    console.error(e);
  }
};
export default func;
func.tags = ["NFTXLPStaking"];
func.dependencies = ["StakingTokenProvider", "MultiProxyController"];
