import { getChainBlockExplorer } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { maybe } from '@primitives/objects.utils'

export type NetworkDef<TId extends string = string, TChainId extends number = number> = {
  blockchainId: TId
  chainId: TChainId
}

export type NetworkMapping<TId extends string = string, TChainId extends number = number> = Record<
  TChainId,
  NetworkDef<TId, TChainId>
>

export const scanAddressPath = (chainId: number, hash: string) =>
  maybe(getChainBlockExplorer(chainId), url => `${url}/address/${hash}`)

export const scanTxPath = (chainId: number, hash: string) =>
  maybe(getChainBlockExplorer(chainId), url => `${url}/tx/${hash}`)

export const scanTokenPath = (chainId: number, hash: string) =>
  maybe(getChainBlockExplorer(chainId), url => `${url}/token/${hash}`)
