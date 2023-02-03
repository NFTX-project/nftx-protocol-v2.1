import { HardhatRuntimeEnvironment, Network } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { utils } from "ethers";
import { setImplementation } from "../../helpers";
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
          viaAdminContract: "MultiProxyController",
          owner: config.MultiProxyControllerOwner, // `owner` of the `adminContract`
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
        viaAdminContract: "MultiProxyController",
        owner: config.MultiProxyControllerOwner, // `owner` of the `adminContract`
      },
      log: true,
    });
  } catch (e) {}

  // not using deployments.get() for implementations here as it returns `undefined` if we had just modified the deployments json file.
  const NFTXVaultFactoryUpgradeable_Implementation = await setImplementation(
    "NFTXVaultFactoryUpgradeable",
    network
  );
  const NFTXInventoryStaking_Implementation = await setImplementation(
    "NFTXInventoryStaking",
    network
  );

  await execute(
    "MultiProxyController",
    { from: deployer },
    "upgradeProxyTo",
    0,
    NFTXVaultFactoryUpgradeable_Implementation
  );
  await execute(
    "MultiProxyController",
    { from: deployer },
    "upgradeProxyTo",
    5,
    NFTXInventoryStaking_Implementation
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

  const NFTXYieldStakingZap = await deployments.get("NFTXYieldStakingZap");
  await execute(
    "NFTXVaultFactoryUpgradeable",
    { from: deployer },
    "setZapContract",
    NFTXYieldStakingZap.address,
    true
  );

  const NFTXVaultCreationZap = await deployments.get("NFTXVaultCreationZap");
  await execute(
    "NFTXVaultFactoryUpgradeable",
    { from: deployer },
    "setZapContract",
    NFTXVaultCreationZap.address,
    true
  );
};
export default func;
func.tags = ["1_AddZapContractsMapping"];
