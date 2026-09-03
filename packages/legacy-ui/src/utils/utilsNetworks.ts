import { getChainBlockExplorer } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { Chain } from '@evm-ui/utils/network'
import { maybe } from '@primitives/objects.utils'

const NETWORK_BASE_CONFIG_DEFAULT = {
  gasL2: false,
  gasPricesUnit: 'GWEI',
  gasPricesUrl: '',
  gasPricesDefault: 0,
}

export const NETWORK_BASE_CONFIG = {
  [Chain.Ethereum]: {
    blockchainId: 'ethereum',
    gasPricesUrl: 'https://api.curve.finance/api/getGas',
    gasPricesDefault: 1,
  },
  [Chain.Optimism]: { blockchainId: 'optimism', gasL2: true },
  [Chain.Gnosis]: { blockchainId: 'xdai' },
  [Chain.Moonbeam]: { blockchainId: 'moonbeam' },
  [Chain.Polygon]: {
    blockchainId: 'polygon',
    gasPricesUrl: 'https://gasstation.polygon.technology/v2',
    gasPricesDefault: 0,
  },
  [Chain.Kava]: { blockchainId: 'kava', gasPricesUnit: 'UKAVA' },
  [Chain.Fantom]: { blockchainId: 'fantom' },
  [Chain.Arbitrum]: { blockchainId: 'arbitrum' },
  [Chain.Avalanche]: {
    blockchainId: 'avalanche',
    gasPricesUnit: 'nAVAX',
    gasPricesUrl: 'https://api.avax.network/ext/bc/C/rpc',
    gasPricesDefault: 0,
  },
  [Chain.Celo]: { blockchainId: 'celo' },
  [Chain.Aurora]: { blockchainId: 'aurora' },
  [Chain.ZkSync]: { blockchainId: 'zksync' },
  [Chain.Base]: { blockchainId: 'base', gasL2: true },
  [Chain.Bsc]: { blockchainId: 'bsc' },
  [Chain.Fraxtal]: { blockchainId: 'fraxtal' },
  [Chain.XLayer]: { blockchainId: 'x-layer' },
  [Chain.Mantle]: { blockchainId: 'mantle' },
  [Chain.Sonic]: { blockchainId: 'sonic' },
  [Chain.Hyperliquid]: { blockchainId: 'hyperliquid' },
} as const

export type NetworkDef<TId extends string = string, TChainId extends number = number> = {
  isLite?: boolean
  blockchainId: TId
  chainId: TChainId
  showInSelectNetwork: boolean
  showRouterSwap?: boolean // only for dex
}

export type NetworkMapping<TId extends string = string, TChainId extends number = number> = Record<
  TChainId,
  NetworkDef<TId, TChainId>
>

export type BaseConfig<TId extends string = string, TChainId extends number = number> = NetworkDef<TId, TChainId> & {
  gasL2: boolean
  gasPricesUnit: string
  gasPricesUrl: string
  gasPricesDefault: number
}

export function getBaseNetworksConfig<TId extends string, ChainId extends number>(
  chainId: ChainId,
  networkConfig: { blockchainId: TId },
): Omit<BaseConfig<TId>, 'showInSelectNetwork' | 'showRouterSwap'> {
  const { ...rest } = { ...NETWORK_BASE_CONFIG_DEFAULT, ...networkConfig }
  return { ...rest, chainId }
}

export const scanAddressPath = (chainId: number, hash: string) =>
  maybe(getChainBlockExplorer(chainId), url => `${url}/address/${hash}`)

export const scanTxPath = (chainId: number, hash: string) =>
  maybe(getChainBlockExplorer(chainId), url => `${url}/tx/${hash}`)

export const scanTokenPath = (chainId: number, hash: string) =>
  maybe(getChainBlockExplorer(chainId), url => `${url}/token/${hash}`)
