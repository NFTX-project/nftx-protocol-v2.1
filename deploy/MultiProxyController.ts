import { HardhatRuntimeEnvironment, Network } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { utils } from "ethers";
import deployConfig from "../deployConfig";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;

  const { deployer } = await getNamedAccounts();
  const config = deployConfig[network.name];

  const MultiProxyController = await deploy("MultiProxyController", {
    from: deployer,
    args: [[], []],
    log: true,
  });
};
export default func;
func.tags = ["MultiProxyController"];
func.dependencies = [];
