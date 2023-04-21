import { HardhatRuntimeEnvironment, Network } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { utils } from "ethers";
import deployConfig from "../deployConfig";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, execute } = deployments;

  const { deployer } = await getNamedAccounts();
  const config = deployConfig[network.name];

  const TimelockExcludeList = await deploy("TimelockExcludeList", {
    from: deployer,
    log: true,
  });

  await execute(
    "NFTXInventoryStaking",
    { from: deployer },
    "setTimelockExcludeList",
    TimelockExcludeList.address
  );
  await execute(
    "NFTXStakingZap",
    { from: deployer },
    "setTimelockExcludeList",
    TimelockExcludeList.address
  );
};
export default func;
func.tags = ["TimelockExcludeList"];
func.dependencies = [
  // "NFTXInventoryStaking",
  // "NFTXStakingZap"
];
