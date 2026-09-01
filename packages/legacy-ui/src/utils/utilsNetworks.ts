import { wagmiChainsMap } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { Chain } from '@evm-ui/utils/network'
import { maybe } from '@primitives/objects.utils'

const NETWORK_BASE_CONFIG_DEFAULT = {
  name: '',
  gasL2: false,
  gasPricesUnit: 'GWEI',
  gasPricesUrl: '',
  gasPricesDefault: 0,
  isTestnet: false,
}

export const NETWORK_BASE_CONFIG = {
  [Chain.Ethereum]: {
    id: 'ethereum',
    gasPricesUrl: 'https://api.curve.finance/api/getGas',
    gasPricesDefault: 1,
  },
  [Chain.Optimism]: { id: 'optimism', gasL2: true },
  [Chain.Gnosis]: { id: 'xdai', name: 'Gnosis' },
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
  [Chain.ZkSync]: { id: 'zksync', name: 'zkSync Era' },
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
  name: string
  chainId: TChainId
  isTestnet: boolean
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
  networkConfig: { id: TId; name?: string; isTestnet?: boolean },
): Omit<BaseConfig<TId>, 'showInSelectNetwork' | 'showRouterSwap'> {
  const { name, id, ...rest } = { ...NETWORK_BASE_CONFIG_DEFAULT, ...networkConfig }
  return {
    ...rest,
    name: formatNetworkName(name || id),
    chainId,
    id, // TODO: remove id or networkId
    networkId: id,
  }
}

/** Capitalizes and separates words in a string by replacing hyphens and underscores with spaces. */
function formatNetworkName(id: string) {
  const formattedText = id.replace(/[-_]./g, match => ' ' + match.charAt(1).toUpperCase())
  return formattedText.charAt(0).toUpperCase() + formattedText.slice(1)
}

const getBlockExplorerUrl = (chainId: number) => wagmiChainsMap[chainId]?.blockExplorers?.default.url

export const scanAddressPath = (chainId: number, hash: string) =>
  maybe(getBlockExplorerUrl(chainId), url => `${url}/address/${hash}`)

export const scanTxPath = (chainId: number, hash: string) =>
  maybe(getBlockExplorerUrl(chainId), url => `${url}/tx/${hash}`)

export const scanTokenPath = (chainId: number, hash: string) =>
  maybe(getBlockExplorerUrl(chainId), url => `${url}/token/${hash}`)
