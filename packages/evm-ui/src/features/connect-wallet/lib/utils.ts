import type { Eip1193Provider } from 'ethers'
import { createCurve } from '@curvefi/api'
import { createLlamalend } from '@curvefi/llamalend-api'
import { NETWORK_CONSTANTS as LLAMA_NETWORKS } from '@curvefi/llamalend-api/lib/llamalend'
import { defaultGetRpcUrls } from '@evm-ui/features/connect-wallet/lib/wagmi/transports'
import { AppName } from '@evm-ui/shared/routes'
import type { NetworkDef } from '@legacy-ui/utils'
import { assert } from '@primitives/objects.utils'
import type { CurveApi, LlamaApi, Wallet } from './types'
import { AppLib, LibChainId, LibKey, LibNetworkId, Libs } from './types'

/**
 * Compare the signer address of the wallet with the one in the library.
 */
const compareSignerAddress = (wallet: Wallet | undefined, lib: Libs[LibKey]) =>
  wallet?.address?.toLowerCase() == (lib?.signerAddress?.toLowerCase() || null)

export const isWalletMatching = <TChainId extends number>(
  wallet: Wallet | undefined,
  lib: Libs[LibKey] | undefined,
  chainId: TChainId | undefined,
) => compareSignerAddress(wallet, lib) && lib?.chainId == chainId

async function initCurve<
  T extends { init: (this: T, ...args: Parameters<ReturnType<typeof createLlamalend>['init']>) => Promise<void> },
>(createApi: () => T, network: NetworkDef, externalProvider: Eip1193Provider | undefined): Promise<T> {
  const { chainId } = network
  const api = createApi()
  if (externalProvider) {
    await api.init('Web3', { externalProvider }, { chainId })
  } else {
    await api.init(
      'JsonRpc',
      { url: assert(defaultGetRpcUrls(chainId)[0], `No RPC URL for chain ${chainId}`) },
      { chainId },
    )
  }
  return api
}

const initLib: {
  [K in LibKey]: (
    network: NetworkDef<LibNetworkId[K], LibChainId[K]>,
    externalProvider?: Eip1193Provider,
  ) => Promise<Libs[K]>
} = {
  llamaApi: async (network, externalProvider) =>
    network.chainId in LLAMA_NETWORKS
      ? ((await initCurve(createLlamalend, network, externalProvider)) as LlamaApi)
      : undefined,
  curveApi: async (network, externalProvider) => (await initCurve(createCurve, network, externalProvider)) as CurveApi,
}

/**
 * Lib is a singleton that holds the current instance of the library.
 * It would be better to use only the context, but we need to be able to access it in the store and query functions.
 */
export const globalLibs = {
  /** Holds the last successfully hydrated lib for each app to avoid rehydrating when switching apps */
  hydrated: {} as { [App in AppName]?: AppLib<App> },

  /** Holds the current instance of each library */
  current: {} as Libs,

  /** Get the current instance of a library */
  get: <K extends LibKey>(key: K): Libs[K] | undefined => globalLibs.current[key],

  /** Get the current instance of a library only if it matches the wallet and chainId */
  getMatching: <K extends LibKey, ChainId extends number>(
    key: K,
    wallet?: Wallet,
    chainId?: ChainId,
  ): Libs[K] | undefined => {
    const lib = globalLibs.current[key]
    if (isWalletMatching(wallet, lib, chainId)) {
      return lib
    }
  },

  /** Get the current instance of a library or throw if not initialized */
  require: <K extends LibKey>(key: K): NonNullable<Libs[K]> => assert(globalLibs.get(key), `${key} not initialized`),

  /** Set the current instance of a library */
  set: <K extends LibKey>(key: K, lib: Libs[K]) => (globalLibs.current[key] = lib),

  /** Initialize a library for a given network and provider */
  init: async <K extends LibKey>(
    key: K,
    network: NetworkDef<LibNetworkId[K], LibChainId[K]>,
    provider?: Eip1193Provider,
  ): Promise<Libs[K]> => await initLib[key](network, provider),
}

export const getLib = globalLibs.get
export const requireLib = globalLibs.require
