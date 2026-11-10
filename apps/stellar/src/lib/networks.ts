import { Networks } from '@creit.tech/stellar-wallets-kit/types'
import { fromEntries, recordEntries } from '@primitives/objects.utils'

const STANDALONE = process.env.STELLAR_STANDALONE === 'true'

export const STELLAR_NETWORKS = {
  stellar: {
    name: 'Stellar',
    chainId: 1500,
    isTestnet: false,
    isLite: true,
    nativeCurrency: {
      symbol: 'XLM',
      decimals: 7,
      address: 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA' as const,
    },
    rpcUrl: 'https://rpc.ankr.com/stellar_soroban',
    allowHttp: false,
    networkPassphrase: Networks.PUBLIC,
    explorerUrl: 'https://stellar.expert/explorer/public/',
  },
  'stellar-testnet': {
    name: 'Stellar testnet',
    chainId: 1501,
    isTestnet: true,
    isLite: true,
    nativeCurrency: {
      symbol: 'XLM',
      decimals: 7,
      address: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC' as const,
    },
    rpcUrl: STANDALONE ? 'http://localhost:8000/rpc' : 'https://soroban-testnet.stellar.org',
    allowHttp: STANDALONE,
    networkPassphrase: STANDALONE ? Networks.STANDALONE : Networks.TESTNET,
    explorerUrl: 'https://stellar.expert/explorer/testnet/',
  },
} as const

export const STELLAR_NETWORKS_BY_ID = fromEntries(
  recordEntries(STELLAR_NETWORKS).map(([blockchainId, network]) => [network.chainId, { blockchainId, ...network }]),
)

export type StellarNetwork = keyof typeof STELLAR_NETWORKS
