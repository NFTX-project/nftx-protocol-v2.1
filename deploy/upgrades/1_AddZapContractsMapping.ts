import { HardhatRuntimeEnvironment, Network } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { utils } from "ethers";
import { promises as fs } from "fs";
import path from "path";
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
  const NFTXVaultFactoryUpgradeable_Implementation = JSON.parse(
    await fs.readFile(
      path.join(
        __dirname,
        `../../deployments/${network.name}/NFTXVaultFactoryUpgradeable_Implementation.json`
      ),
      "utf8"
    )
  );
  const NFTXInventoryStaking_Implementation = JSON.parse(
    await fs.readFile(
      path.join(
        __dirname,
        `../../deployments/${network.name}/NFTXInventoryStaking_Implementation.json`
      ),
      "utf8"
    )
  );

  console.log({
    NFTXVaultFactoryUpgradeable_Implementation:
      NFTXVaultFactoryUpgradeable_Implementation.address,
    NFTXInventoryStaking_Implementation:
      NFTXInventoryStaking_Implementation.address,
  });

  // await execute(
  //   "MultiProxyController",
  //   { from: deployer },
  //   "upgradeProxyTo",
  //   0,
  //   NFTXVaultFactoryUpgradeable_Implementation.address
  // );
  // await execute(
  //   "MultiProxyController",
  //   { from: deployer },
  //   "upgradeProxyTo",
  //   5,
  //   NFTXInventoryStaking_Implementation.address
  // );

  // add zaps to `zapContracts` mapping
  // const NFTXStakingZap = await deployments.get("NFTXStakingZap");
  // await execute(
  //   "NFTXVaultFactoryUpgradeable",
  //   { from: deployer },
  //   "setZapContract",
  //   NFTXStakingZap.address,
  //   true
  // );

  // const NFTXYieldStakingZap = await deployments.get("NFTXYieldStakingZap");
  // await execute(
  //   "NFTXVaultFactoryUpgradeable",
  //   { from: deployer },
  //   "setZapContract",
  //   NFTXYieldStakingZap.address,
  //   true
  // );

  // const NFTXVaultCreationZap = await deployments.get("NFTXVaultCreationZap");
  // await execute(
  //   "NFTXVaultFactoryUpgradeable",
  //   { from: deployer },
  //   "setZapContract",
  //   NFTXVaultCreationZap.address,
  //   true
  // );
};
export default func;
func.tags = ["1_AddZapContractsMapping"];
