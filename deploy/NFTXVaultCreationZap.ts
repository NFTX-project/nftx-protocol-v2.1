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
  const NFTXInventoryStaking = await deployments.get("NFTXInventoryStaking");
  const NFTXLPStaking = await deployments.get("NFTXLPStaking");
  const SushiHelper = await deployments.get("SushiHelper");

  const NFTXVaultCreationZap = await deploy("NFTXVaultCreationZap", {
    from: deployer,
    args: [
      NFTXVaultFactoryUpgradeable.address,
      NFTXInventoryStaking.address,
      NFTXLPStaking.address,
      config.sushiRouter,
      SushiHelper.address,
      config.WETH,
    ],
    log: true,
  });

  // configure other contracts
  await execute(
    "NFTXVaultFactoryUpgradeable",
    { from: deployer },
    "setFeeExclusion",
    NFTXVaultCreationZap.address,
    true
  );
  await execute(
    "NFTXVaultFactoryUpgradeable",
    { from: deployer },
    "setZapContract",
    NFTXVaultCreationZap.address,
    true
  );
};
export default func;
func.tags = ["NFTXVaultCreationZap"];
func.dependencies = [
  // "NFTXVaultFactoryUpgradeable",
  // "NFTXInventoryStaking",
  // "NFTXLPStaking",
  "SushiHelper",
];
