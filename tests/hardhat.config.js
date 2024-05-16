process.env.NODE_ENV = process.env.NODE_ENV || 'development'

require('dotenv-flow').config()
require('@nomicfoundation/hardhat-ethers')

const forkingConfig = {
  httpHeaders: {
    Origin: 'localhost:3000',
  },
}

// TODO: move this to a constants file
const ChainId = {
  MAINNET: 1,
  POLYGON: 137,
}

const forks = {
  [ChainId.MAINNET]: {
    url: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
    blockNumber: 19748200,
    ...forkingConfig,
    port: 8545 + ChainId.MAINNET,
    chainId: ChainId.MAINNET,
  },
  [ChainId.POLYGON]: {
    url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
    blockNumber: 56968100,
    ...forkingConfig,
    port: 8545 + ChainId.POLYGON,
    chainId: ChainId.POLYGON,
  },
}

const network = parseInt(process.env.HARDHAT_CHAIN_ID) || ChainId.MAINNET
const networkConfig = forks[network]

module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: networkConfig.chainId,
      forking: {
        url: networkConfig.url,
        blockNumber: networkConfig.blockNumber,
        httpHeaders: networkConfig.httpHeaders,
      },
      accounts: {
        count: 0,
      },
      mining: {
        auto: true,
        interval: 0,
      },
    },
  },
}
