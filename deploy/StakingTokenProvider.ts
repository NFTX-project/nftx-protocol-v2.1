import { HardhatRuntimeEnvironment, Network } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { utils } from "ethers";
import deployConfig from "../deployConfig";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  const config = deployConfig[network.name];

  const StakingTokenProvider = await deploy("StakingTokenProvider", {
    from: deployer,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        methodName: "__StakingTokenProvider_init",
        args: [
          config.uniLikeExchange,
          config.defaultPairedtoken,
          config.defaultPrefix,
        ],
      },
    },
    log: true,
  });
};
export default func;
func.tags = ["StakingTokenProvider"];
func.dependencies = [];
