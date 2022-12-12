const config: {
  [networkName: string]: {
    uniLikeExchange: string;
    defaultPairedtoken: string;
    defaultPrefix: string;
    treasury: string;
    sushiRouter: string;
    WETH: string;
    swapTarget: string;
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
  },
};

export default config;
