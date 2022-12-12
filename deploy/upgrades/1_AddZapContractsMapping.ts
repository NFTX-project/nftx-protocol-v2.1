import { HardhatRuntimeEnvironment, Network } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { utils } from "ethers";
import deployConfig from "../../deployConfig";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, execute } = deployments;

  const { deployer } = await getNamedAccounts();
  const config = deployConfig[network.name];

  // @note upgrading will fail here as proxies owned by MultiProxyController
  // so let the following code deploy new implementation (despite error), store it in deployments folder and then upgrade proxy implementation

  try {
    const NFTXVaultFactoryUpgradeable = await deploy(
      "NFTXVaultFactoryUpgradeable",
      {
        from: deployer,
        proxy: {
          proxyContract: "OpenZeppelinTransparentProxy",
        },
        log: true,
      }
    );
  } catch (e) {}

  try {
    const NFTXInventoryStaking = await deploy("NFTXInventoryStaking", {
      from: deployer,
      proxy: {
        proxyContract: "OpenZeppelinTransparentProxy",
      },
      log: true,
    });
  } catch (e) {}

  // upgrade with new implementation
  const NFTXVaultFactoryUpgradeable = await deployments.get(
    "NFTXVaultFactoryUpgradeable"
  );
  const NFTXInventoryStaking = await deployments.get("NFTXInventoryStaking");
  await execute(
    "MultiProxyController",
    { from: deployer },
    "upgradeProxyTo",
    0,
    NFTXVaultFactoryUpgradeable.implementation
  );
  await execute(
    "MultiProxyController",
    { from: deployer },
    "upgradeProxyTo",
    5,
    NFTXInventoryStaking.implementation
  );

  // add zaps to `zapContracts` mapping
  const NFTXStakingZap = await deployments.get("NFTXStakingZap");
  await execute(
    "NFTXVaultFactoryUpgradeable",
    { from: deployer },
    "setZapContract",
    NFTXStakingZap.address,
    true
  );
};
export default func;
func.tags = ["1_AddZapContractsMapping"];
