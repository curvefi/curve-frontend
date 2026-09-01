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
    id: 'ethereum',
    gasPricesUrl: 'https://api.curve.finance/api/getGas',
    gasPricesDefault: 1,
  },
  [Chain.Optimism]: { id: 'optimism', gasL2: true },
  [Chain.Gnosis]: { id: 'xdai' },
  [Chain.Moonbeam]: { id: 'moonbeam' },
  [Chain.Polygon]: {
    id: 'polygon',
    gasPricesUrl: 'https://gasstation.polygon.technology/v2',
    gasPricesDefault: 0,
  },
  [Chain.Kava]: { id: 'kava', gasPricesUnit: 'UKAVA' },
  [Chain.Fantom]: { id: 'fantom' },
  [Chain.Arbitrum]: { id: 'arbitrum' },
  [Chain.Avalanche]: {
    id: 'avalanche',
    gasPricesUnit: 'nAVAX',
    gasPricesUrl: 'https://api.avax.network/ext/bc/C/rpc',
    gasPricesDefault: 0,
  },
  [Chain.Celo]: { id: 'celo' },
  [Chain.Aurora]: { id: 'aurora' },
  [Chain.ZkSync]: { id: 'zksync' },
  [Chain.Base]: { id: 'base', gasL2: true },
  [Chain.Bsc]: { id: 'bsc' },
  [Chain.Fraxtal]: { id: 'fraxtal' },
  [Chain.XLayer]: { id: 'x-layer' },
  [Chain.Mantle]: { id: 'mantle' },
  [Chain.Sonic]: { id: 'sonic' },
  [Chain.Hyperliquid]: { id: 'hyperliquid' },
} as const

export type NetworkDef<TId extends string = string, TChainId extends number = number> = {
  isLite?: boolean
  id: TId
  chainId: TChainId
  showInSelectNetwork: boolean
  showRouterSwap?: boolean // only for dex
}

export type NetworkMapping<TId extends string = string, TChainId extends number = number> = Record<
  TChainId,
  NetworkDef<TId, TChainId>
>

export type BaseConfig<TId extends string = string, TChainId extends number = number> = NetworkDef<TId, TChainId> & {
  networkId: string
  gasL2: boolean
  gasPricesUnit: string
  gasPricesUrl: string
  gasPricesDefault: number
}

export function getBaseNetworksConfig<TId extends string, ChainId extends number>(
  chainId: ChainId,
  networkConfig: { id: TId },
): Omit<BaseConfig<TId>, 'showInSelectNetwork' | 'showRouterSwap'> {
  const { id, ...rest } = { ...NETWORK_BASE_CONFIG_DEFAULT, ...networkConfig }
  return {
    ...rest,
    chainId,
    id, // TODO: remove id or networkId
    networkId: id,
  }
}

export const scanAddressPath = (chainId: number, hash: string) =>
  maybe(getChainBlockExplorer(chainId), url => `${url}/address/${hash}`)

export const scanTxPath = (chainId: number, hash: string) =>
  maybe(getChainBlockExplorer(chainId), url => `${url}/tx/${hash}`)

export const scanTokenPath = (chainId: number, hash: string) =>
  maybe(getChainBlockExplorer(chainId), url => `${url}/token/${hash}`)
