import { HardhatRuntimeEnvironment, Network } from "hardhat/types";
import { DeployFunction, DeployResult } from "hardhat-deploy/types";
import { utils } from "ethers";
import deployConfig from "../../deployConfig";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, execute } = deployments;

  const { deployer } = await getNamedAccounts();
  const config = deployConfig[network.name];

  // At time of writing (16-12-22) the `EligibilityManager:allModuleNames`` returns this order
  eligibilityModules = [
    'NFTXListEligibility'
    'NFTXRangeEligibility',
    'NFTXGen0Eligibility',
    'NFTXENSMerkleEligibility',
  ];

  for (let i = 0; i < eligibilityModules.length; ++i) {
    try {
      const eligibilityModule = await deploy(eligibilityModules[i], {
        from: deployer,
        log: true,
      });
    } catch (e) {}

    // upgrade with new implementation
    const EligibilityManager = await deployments.get("NFTXEligibilityManager");
    await execute(
      "NFTXEligibilityManager",
      { from: deployer },
      "addModule",
      eligibilityModule.address,
      EligibilityManager.implementation
    );
  }

};

export default func;
func.tags = ["3_AddEligibilityModules"];
