import { HardhatRuntimeEnvironment, Network } from "hardhat/types";
import { DeployFunction, DeployResult } from "hardhat-deploy/types";
import { utils } from "ethers";
import deployConfig from "../../deployConfig";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, execute } = deployments;

  const { deployer } = await getNamedAccounts();
  const config = deployConfig[network.name];

  // At time of writing (16-12-22) the `EligibilityManager:allModuleNames` returns this order
  const eligibilityModules = [
    "NFTXListEligibility",
    "NFTXRangeEligibility",
    "NFTXGen0KittyEligibility",
    "NFTXENSMerkleEligibility",
  ];

  for (let i = 0; i < eligibilityModules.length; ++i) {
    const eligibilityModule = await deploy(eligibilityModules[i], {
      from: deployer,
      log: true,
    });

    await execute(
      "NFTXEligibilityManager",
      { from: deployer },
      "addModule",
      eligibilityModule.address
    );
  }
};

export default func;
func.tags = ["3_AddEligibilityModules"];
