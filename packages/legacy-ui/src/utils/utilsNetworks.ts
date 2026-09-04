import { getChainBlockExplorer } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { Chain } from '@evm-ui/utils/network'
import { maybe } from '@primitives/objects.utils'

export const NETWORK_BASE_CONFIG = {
  [Chain.Ethereum]: { blockchainId: 'ethereum' },
  [Chain.Optimism]: { blockchainId: 'optimism' },
  [Chain.Gnosis]: { blockchainId: 'xdai' },
  [Chain.Moonbeam]: { blockchainId: 'moonbeam' },
  [Chain.Polygon]: { blockchainId: 'polygon' },
  [Chain.Kava]: { blockchainId: 'kava' },
  [Chain.Fantom]: { blockchainId: 'fantom' },
  [Chain.Arbitrum]: { blockchainId: 'arbitrum' },
  [Chain.Avalanche]: { blockchainId: 'avalanche' },
  [Chain.Celo]: { blockchainId: 'celo' },
  [Chain.Aurora]: { blockchainId: 'aurora' },
  [Chain.ZkSync]: { blockchainId: 'zksync' },
  [Chain.Base]: { blockchainId: 'base' },
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

export const getBaseNetworksConfig = <TId extends string, ChainId extends number>(
  chainId: ChainId,
  networkConfig: { blockchainId: TId },
): Omit<NetworkDef<TId>, 'showInSelectNetwork' | 'showRouterSwap'> => ({ ...networkConfig, chainId })

export const scanAddressPath = (chainId: number, hash: string) =>
  maybe(getChainBlockExplorer(chainId), url => `${url}/address/${hash}`)

export const scanTxPath = (chainId: number, hash: string) =>
  maybe(getChainBlockExplorer(chainId), url => `${url}/tx/${hash}`)

export const scanTokenPath = (chainId: number, hash: string) =>
  maybe(getChainBlockExplorer(chainId), url => `${url}/token/${hash}`)
