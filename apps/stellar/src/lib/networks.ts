import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { Networks } from '@creit.tech/stellar-wallets-kit/types'
import { fromEntries, recordEntries } from '@primitives/objects.utils'
import type { PoolType } from '@ui/features/create-pool/types'

const STANDALONE = process.env.STELLAR_STANDALONE === 'true'

export type StellarFactory = { address: StellarContract; implementationIndex: number }
export type StellarFactories = Partial<Record<PoolType, readonly StellarFactory[]>>

// Each factory pins a registered pool implementation; index 0 is the initial plain-pool implementation.
export const STELLAR_NETWORKS = {
  stellar: {
    factories: {
      stableswap: [{ implementationIndex: 0, address: 'CC2DWZ5RDSC5BZKEDQ5BABNUATX5EFJ4GCOENDXULEDVBHH2OKXFKYS5' }],
    } satisfies StellarFactories,
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
    horizonUrl: 'https://horizon.stellar.org',
    allowHttp: false,
    networkPassphrase: Networks.PUBLIC,
    explorerUrl: 'https://stellar.expert/explorer/public/',
  },
  'stellar-testnet': {
    factories: {
      stableswap: [{ implementationIndex: 0, address: 'CDCOYFMUZZQRKQ533O5WKAG3OHIPMYUBCRLPVW45UAKPK5ZPUGMMWXNO' }],
    } satisfies StellarFactories,
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
    horizonUrl: STANDALONE ? 'http://localhost:8000' : 'https://horizon-testnet.stellar.org',
    allowHttp: STANDALONE,
    networkPassphrase: STANDALONE ? Networks.STANDALONE : Networks.TESTNET,
    explorerUrl: 'https://stellar.expert/explorer/testnet/',
  },
} as const

export const STELLAR_NETWORKS_BY_ID = fromEntries(
  recordEntries(STELLAR_NETWORKS).map(([blockchainId, network]) => [network.chainId, { blockchainId, ...network }]),
)

export type StellarNetwork = keyof typeof STELLAR_NETWORKS
