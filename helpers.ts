import { Network } from "hardhat/types";
import { promises as fs } from "fs";
import path from "path";
import { format } from "prettier";

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

// alternative to deployments.get() for implementations as it returns `undefined` if we had just modified the deployments json file.
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
    format(JSON.stringify(contract), {
      semi: false,
      parser: "json",
    })
  );

  return contractImplementation.address;
};
