import { HardhatRuntimeEnvironment, Network } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { utils } from "ethers";
import deployConfig from "../deployConfig";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, execute } = deployments;

  const { deployer } = await getNamedAccounts();
  const config = deployConfig[network.name];

  const NFTXVaultUpgradeableImpl = await deploy("NFTXVaultUpgradeable", {
    from: deployer,
    log: true,
  });

  const NFTXSimpleFeeDistributor = await deployments.get(
    "NFTXSimpleFeeDistributor"
  );

  const NFTXVaultFactoryUpgradeable = await deploy(
    "NFTXVaultFactoryUpgradeable",
    {
      from: deployer,
      proxy: {
        proxyContract: "OpenZeppelinTransparentProxy",
        execute: {
          init: {
            methodName: "__NFTXVaultFactory_init",
            args: [
              NFTXVaultUpgradeableImpl.address,
              NFTXSimpleFeeDistributor.address,
            ],
          },
        },
      },
      log: true,
    }
  );

  // modify factory fees
  await execute(
    "NFTXVaultFactoryUpgradeable",
    { from: deployer },
    "setFactoryFees",
    "100000000000000000",
    "40000000000000000",
    "60000000000000000",
    "40000000000000000",
    "100000000000000000"
  );

  // set deployed address in other contracts
  await execute(
    "NFTXLPStaking",
    { from: deployer },
    "setNFTXVaultFactory",
    NFTXVaultFactoryUpgradeable.address
  );
  await execute(
    "NFTXSimpleFeeDistributor",
    { from: deployer },
    "setNFTXVaultFactory",
    NFTXVaultFactoryUpgradeable.address
  );
};
export default func;
func.tags = ["NFTXVaultFactoryUpgradeable"];
func.dependencies = ["NFTXSimpleFeeDistributor", "NFTXLPStaking"];
