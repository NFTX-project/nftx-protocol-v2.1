import { HardhatRuntimeEnvironment, Network } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { utils } from "ethers";
import deployConfig from "../deployConfig";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  const config = deployConfig[network.name];

  const NFTXLPStaking = await deployments.get("NFTXLPStaking");

  const NFTXSimpleFeeDistributor = await deploy("NFTXSimpleFeeDistributor", {
    from: deployer,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      viaAdminContract: "MultiProxyController",
      owner: config.MultiProxyControllerOwner, // `owner` of the `adminContract`
      execute: {
        init: {
          methodName: "__SimpleFeeDistributor__init__",
          args: [NFTXLPStaking.address, config.treasury],
        },
      },
    },
    log: true,
  });
};
export default func;
func.tags = ["NFTXSimpleFeeDistributor"];
func.dependencies = ["NFTXLPStaking", "MultiProxyController"];
