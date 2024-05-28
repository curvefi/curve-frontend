process.env.NODE_ENV = process.env.NODE_ENV || 'development'
require('dotenv-flow').config()

const networks = require('./cypress/fixtures/networks.json')

const BASIC_PORT = 8545

const getForkConfig = (networkId) => {
  const network = networks[networkId]
  if (!network) {
    throw new Error(`Network with id ${networkId} not found`)
  }

  const infuraKey = process.env.INFURA_PROJECT_ID
  const alchemyEnvName = `${networkId.toUpperCase()}_ALCHEMY_API_KEY`
  const alchemyKey = process.env[alchemyEnvName] ?? ''

  if (!infuraKey && !alchemyKey) {
    throw new Error(`Either INFURA_PROJECT_ID or ${alchemyEnvName} must be provided`)
  }

  const url = infuraKey
    ? network.infura_rpc.replace('INFURA_PROJECT_ID', infuraKey)
    : network.alchemy_rpc.replace(alchemyEnvName, alchemyKey)

  return {
    url,
    blockNumber: network.fork_block,
    port: BASIC_PORT + network.id,
    chainId: network.id,
  }
}

const networkId = process.env.HARDHAT_CHAIN_ID ?? '1'
const networkConfig = getForkConfig(networkId)

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
        ...(process.env.HARDHAT_MNEMONIC ? { mnemonic: process.env.HARDHAT_MNEMONIC } : {}),
        count: 5,
      },
      mining: {
        auto: true,
      },
    },
  },
}
