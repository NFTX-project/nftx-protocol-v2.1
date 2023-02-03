import { Network } from "hardhat/types";
import { promises as fs } from "fs";
import path from "path";

export const getDeploymentFileByName = async (
  fileName: string,
  network: Network
) => {
  return JSON.parse(
    await fs.readFile(
      path.join(__dirname, `./deployments/${network.name}/${fileName}.json`),
      "utf8"
    )
  );
};

export const setImplementation = async (
  contractName: string,
  network: Network
) => {
  const contract = await getDeploymentFileByName(contractName, network);
  const contractImplementation = await getDeploymentFileByName(
    `${contractName}_Implementation`,
    network
  );

  contract.implementation = contractImplementation.address;

  await fs.writeFile(
    path.join(__dirname, `./deployments/${network.name}/${contractName}.json`),
    JSON.stringify(contract)
  );

  return contractImplementation.address;
};
