import type { Eip1193Provider } from 'ethers/lib.esm'
import { createCurve } from '@curvefi/api'
import { createLlamalend } from '@curvefi/llamalend-api'
import type { NetworkDef } from '@ui/utils'
import type { LlamaApi, Wallet } from '@ui-kit/features/connect-wallet'
import type {
  CurveChainId,
  CurveNetworkId,
  LibChainId,
  LibKey,
  LibNetworkId,
  Libs,
  LlamaNetworkId,
  LlamaChainId,
} from '@ui-kit/features/connect-wallet/lib/types'
import { AppName } from '@ui-kit/shared/routes'

export const AppLibs: Record<AppName, LibKey> = {
  crvusd: 'llamaApi',
  dao: 'curveApi',
  dex: 'curveApi',
  lend: 'llamaApi',
}

/**
 * Compare the signer address of the wallet with the one in the library.
 */
export const compareSignerAddress = (wallet: Wallet | undefined, lib: Libs[LibKey]) =>
  wallet?.account.address?.toLowerCase() == (lib?.signerAddress?.toLowerCase() || null)

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
  llamaApi: async (
    network: NetworkDef<LlamaNetworkId, LlamaChainId>,
    externalProvider: Eip1193Provider | undefined,
  ) => {
    if (!externalProvider) {
      return
    }
    const api = createLlamalend()
    await api.init('Web3', { network, externalProvider }, { chainId: network.chainId })
    return api as LlamaApi
  },
  curveApi: async (
    network: NetworkDef<CurveNetworkId, CurveChainId>,
    externalProvider: Eip1193Provider | undefined,
  ) => {
    const { chainId } = network
    const curveApi = createCurve()
    if (externalProvider) {
      await curveApi.init('Web3', { network, externalProvider }, { chainId })
    } else {
      await curveApi.init('NoRPC', 'NoRPC', { chainId })
    }
    return curveApi
  },
}

/**
 * Lib is a singleton that holds the current instance of the library.
 * It would be better to use only the context, but we need to be able to access it in the store and query functions.
 */
export const globalLibs = {
  current: {} as Libs,
  get: <K extends LibKey>(key: K): Libs[K] | undefined => globalLibs.current[key],
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
  require<K extends LibKey>(key: K): NonNullable<Libs[K]> {
    const value = globalLibs.get(key)
    if (!value) throw new Error(`${key} not initialized`)
    return value
  },
  set: <K extends LibKey>(key: K, lib: Libs[K]) => (globalLibs.current[key] = lib),
  init: async <K extends LibKey>(
    key: K,
    network: NetworkDef<LibNetworkId[K], LibChainId[K]>,
    provider?: Eip1193Provider,
  ): Promise<Libs[K]> => await initLib[key](network, provider),
}

export const getLib = globalLibs.get
export const requireLib = globalLibs.require
