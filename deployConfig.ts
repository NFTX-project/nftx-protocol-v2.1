const config: {
  [networkName: string]: {
    uniLikeExchange: string;
    defaultPairedtoken: string;
    defaultPrefix: string;
    treasury: string;
    sushiRouter: string;
    WETH: string;
    swapTarget: string;
    MultiProxyControllerOwner: string;
  };
} = {
  goerli: {
    uniLikeExchange: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
    defaultPairedtoken: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    defaultPrefix: "x",
    treasury: "0x000000000000000000000000000000000000dEaD",
    sushiRouter: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    WETH: "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
    swapTarget: "0xF91bB752490473B8342a3E964E855b9f9a2A668e",
    MultiProxyControllerOwner: "0xDEA9196Dcdd2173D6E369c2AcC0faCc83fD9346a",
  },
  sepolia: {
    uniLikeExchange: "0xbb4B7cf5a75cc2Ac66A03FAC97Af67E8c364B4Cd", // Sushiswap Factory ["UniswapV2Factory"]
    defaultPairedtoken: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14", // WETH
    defaultPrefix: "x",
    treasury: "0xDEA9196Dcdd2173D6E369c2AcC0faCc83fD9346a",
    sushiRouter: "0xEa8D67a95E1172718CbD601F0742B2ba4E45bC7C", // ["UniswapV2Router02"]
    WETH: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
    swapTarget: "0x000000000000000000000000000000000000dEaD", // 0x not yet on sepolia
    MultiProxyControllerOwner: "0xDEA9196Dcdd2173D6E369c2AcC0faCc83fD9346a",
  },
  mainnet: {
    uniLikeExchange: "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac", // Sushiswap Factory
    defaultPairedtoken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
    defaultPrefix: "x",
    treasury: "0x40D73Df4F99bae688CE3C23a01022224FE16C7b2",
    sushiRouter: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    swapTarget: "0xDef1C0ded9bec7F1a1670819833240f027b25EfF",
    MultiProxyControllerOwner: "0xaA29881aAc939A025A3ab58024D7dd46200fB93D",
  },
  arbitrum: {
    uniLikeExchange: "0xc35DADB65012eC5796536bD9864eD8773aBc74C4",
    defaultPairedtoken: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    defaultPrefix: "x",
    treasury: "0x000000000000000000000000000000000000dEaD",
    sushiRouter: "0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506",
    WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    swapTarget: "0xDef1C0ded9bec7F1a1670819833240f027b25EfF",
    MultiProxyControllerOwner: "0x3863A65CE278a240f9Aa2A4b4A48493bE59E6139",
  },
};

export default config;
