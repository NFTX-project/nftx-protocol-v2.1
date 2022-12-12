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
  // so let the following code deploy new implementation (despite error), store it in deployments folder and manually upgrade proxy implementation

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
  const NFTXInventoryStaking = await deploy("NFTXInventoryStaking", {
    from: deployer,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
    },
    log: true,
  });
};
export default func;
func.tags = ["1_AddZapContractsMapping"];
