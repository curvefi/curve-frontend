import type { Eip1193Provider } from 'ethers'
import { Address } from 'viem'
import { type default as curveApi } from '@curvefi/api'
import type { IChainId as CurveChainId, INetworkName as CurveNetworkId } from '@curvefi/api/lib/interfaces'
import { type default as llamaApi } from '@curvefi/llamalend-api'
import type { IChainId as LlamaChainId, INetworkName as LlamaNetworkId } from '@curvefi/llamalend-api/lib/interfaces'
import { AppName } from '@ui-kit/shared/routes'

export type Wallet = {
  readonly provider?: Eip1193Provider
  readonly account: { address: Address; ensName?: string }
}

export enum ConnectState {
  LOADING = 'loading',
  FAILURE = 'failure',
  HYDRATING = 'hydrating',
  SUCCESS = 'success',
}

export type CurveApi = typeof curveApi & { chainId: CurveChainId; signerAddress?: Address }
export type LlamaApi = typeof llamaApi & { chainId: LlamaChainId; signerAddress: Address }
export type AnyCurveApi = CurveApi | LlamaApi

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

export const AppLibs = {
  crvusd: 'llamaApi',
  dao: 'curveApi',
  dex: 'curveApi',
  lend: 'llamaApi',
  llamalend: 'llamaApi',
} satisfies Record<AppName, LibKey>
type AppLibMap = typeof AppLibs

export type AppLib<A extends AppName> = Libs[AppLibMap[A]]
export type AppChainId<A extends AppName> = LibChainId[(typeof AppLibs)[A]]
export type AppNetworkId<A extends AppName> = LibNetworkId[(typeof AppLibs)[A]]

export type Hydrator<App extends AppName> = (
  lib: AppLib<App>,
  prevLib: AppLib<App> | undefined,
  wallet?: Wallet,
) => Promise<void>
export type HydratorMap = { [A in AppName]?: Hydrator<A> }

export { CurveChainId, LlamaChainId, CurveNetworkId, LlamaNetworkId }
