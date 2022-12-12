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

  const NFTXLPStaking = await deploy("NFTXLPStaking", {
    from: deployer,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        init: {
          methodName: "__NFTXLPStaking__init",
          args: [StakingTokenProvider.address],
        },
      },
    },
    log: true,
  });
};
export default func;
func.tags = ["NFTXLPStaking"];
func.dependencies = ["StakingTokenProvider"];
