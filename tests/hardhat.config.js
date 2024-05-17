process.env.NODE_ENV = process.env.NODE_ENV || 'development'

require('dotenv-flow').config()

// TODO: move this to a constants file
const ChainId = {
  MAINNET: 1,
  POLYGON: 137,
}
const BASIC_PORT = 8545

const forks = {
  [ChainId.MAINNET]: {
    url: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
    blockNumber: 19748200,
    port: BASIC_PORT + ChainId.MAINNET,
    chainId: ChainId.MAINNET,
  },
  [ChainId.POLYGON]: {
    url: `https://polygon-mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
    blockNumber: 56968100,
    port: BASIC_PORT + ChainId.POLYGON,
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
      hardfork: 'cancun',
      gas: 'auto',
      gasPrice: 'auto',
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      loggingEnabled: true,
      forking: {
        url: networkConfig.url,
        blockNumber: networkConfig.blockNumber,
        httpHeaders: {
          Origin: 'localhost:3000',
        },
      },
      accounts: {
        count: 5,
        // mnemonic: MNEMONIC,
      },
      mining: {
        auto: true,
      },
    },
  },
}
