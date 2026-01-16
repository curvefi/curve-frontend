import type { Eip1193Provider } from 'ethers'
import { createCurve } from '@curvefi/api'
import { createLlamalend } from '@curvefi/llamalend-api'
import { NETWORK_CONSTANTS as LLAMA_NETWORKS } from '@curvefi/llamalend-api/lib/llamalend'
import type { NetworkDef } from '@ui/utils'
import type { LlamaApi, Wallet } from '@ui-kit/features/connect-wallet'
import { AppLib, CurveApi, LibChainId, LibKey, LibNetworkId, Libs } from '@ui-kit/features/connect-wallet/lib/types'
import { AppName } from '@ui-kit/shared/routes'

/**
 * Compare the signer address of the wallet with the one in the library.
 */
export const compareSignerAddress = (wallet: Wallet | undefined, lib: Libs[LibKey]) =>
  wallet?.address?.toLowerCase() == (lib?.signerAddress?.toLowerCase() || null)

export const isWalletMatching = <TChainId extends number>(
  wallet: Wallet | undefined,
  lib: Libs[LibKey] | undefined,
  chainId: TChainId | undefined,
) => compareSignerAddress(wallet, lib) && lib?.chainId == chainId

const initLib: {
  [K in LibKey]: (
    network: NetworkDef<LibNetworkId[K], LibChainId[K]>,
    externalProvider?: Eip1193Provider,
  ) => Promise<Libs[K]>
} = {
  llamaApi: async (network, externalProvider) => {
    if (!externalProvider || !(network.chainId in LLAMA_NETWORKS)) {
      return
    }
    const api = createLlamalend()
    await api.init('Web3', { network, externalProvider }, { chainId: network.chainId })
    return api as LlamaApi
  },
  curveApi: async (network, externalProvider) => {
    const { chainId } = network
    const curveApi = createCurve()
    if (externalProvider) {
      await curveApi.init('Web3', { network, externalProvider }, { chainId })
    } else {
      await curveApi.init('NoRPC', 'NoRPC', { chainId })
    }
    return curveApi as CurveApi
  },
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
  require<K extends LibKey>(key: K): NonNullable<Libs[K]> {
    const lib = globalLibs.get(key)
    if (!lib) throw new Error(`${key} not initialized`)
    return lib
  },

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
