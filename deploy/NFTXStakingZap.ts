import { HardhatRuntimeEnvironment, Network } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { utils } from "ethers";
import deployConfig from "../deployConfig";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, execute } = deployments;

  const { deployer } = await getNamedAccounts();
  const config = deployConfig[network.name];

  const NFTXVaultFactoryUpgradeable = await deployments.get(
    "NFTXVaultFactoryUpgradeable"
  );

  const NFTXStakingZap = await deploy("NFTXStakingZap", {
    from: deployer,
    args: [NFTXVaultFactoryUpgradeable.address, config.sushiRouter],
    log: true,
  });
  // set values
  await execute("NFTXStakingZap", { from: deployer }, "setLPLockTime", 600);
  await execute(
    "NFTXStakingZap",
    { from: deployer },
    "setInventoryLockTime",
    800
  );
  await execute("NFTXStakingZap", { from: deployer }, "assignStakingContracts");

  // configure other contracts
  await execute(
    "NFTXVaultFactoryUpgradeable",
    { from: deployer },
    "setFeeExclusion",
    NFTXStakingZap.address,
    true
  );
  await execute(
    "NFTXVaultFactoryUpgradeable",
    { from: deployer },
    "setZapContract",
    NFTXStakingZap.address
  );
};
export default func;
func.tags = ["NFTXStakingZap"];
func.dependencies = ["NFTXVaultFactoryUpgradeable"];
