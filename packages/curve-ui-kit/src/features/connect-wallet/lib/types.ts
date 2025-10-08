import type { Eip1193Provider } from 'ethers'
import { Address } from 'viem'
import { type default as curveApi } from '@curvefi/api'
import type { IChainId as CurveChainId, INetworkName as CurveNetworkId } from '@curvefi/api/lib/interfaces'
import { type default as llamaApi } from '@curvefi/llamalend-api'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'

export type Wallet = {
  readonly provider?: Eip1193Provider
  readonly account: { address: Address; ensName?: string }
}

export enum ConnectState {
  LOADING = 'loading',
  SUCCESS = 'success',
  FAILURE = 'failure',
}

export type CurveApi = typeof curveApi & { chainId: CurveChainId; signerAddress?: Address; hydrated?: boolean }
export type LlamaApi = typeof llamaApi & { chainId: LlamaChainId; signerAddress: Address; hydrated?: boolean }

export type LibChainId = {
  curveApi: CurveChainId
  llamaApi: LlamaChainId
}

export type LibNetworkId = {
  curveApi: CurveNetworkId
  llamaApi: LlamaNetworkId
}

export type Libs = {
  llamaApi?: LlamaApi
  curveApi?: CurveApi
}

export type LibKey = keyof Libs

export { CurveChainId, LlamaChainId, CurveNetworkId, LlamaNetworkId }
