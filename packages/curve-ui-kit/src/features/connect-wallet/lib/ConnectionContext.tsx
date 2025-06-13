'use client'
import { BrowserProvider } from 'ethers'
import type { Eip1193Provider } from 'ethers/lib.esm'
import { createContext, type ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAccount, useChainId, useConnectorClient, useSwitchChain } from 'wagmi'
import { createCurve, type default as curveApi } from '@curvefi/api'
import type { IChainId as CurveChainId } from '@curvefi/api/lib/interfaces'
import { createLlamalend, type default as llamaApi } from '@curvefi/llamalend-api'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import type { NetworkDef } from '@ui/utils'
import { useIsDocumentFocused } from '@ui-kit/features/layout/utils'
import type { AppName } from '@ui-kit/shared/routes'
import { type Wallet } from './types'
import { type WagmiChainId } from './wagmi/wagmi-config'

export type CurveApi = typeof curveApi & { chainId: CurveChainId; signerAddress?: string }
export type LlamaApi = typeof llamaApi & { chainId: LlamaChainId; signerAddress?: string }

enum ConnectState {
  LOADING = 'loading',
  SUCCESS = 'success',
  FAILURE = 'failure',
}

const { FAILURE, LOADING, SUCCESS } = ConnectState

export const isSuccess = (status: ConnectState) => status === SUCCESS
export const isFailure = (status: ConnectState) => status === FAILURE
export const isLoading = (status: ConnectState) => status === LOADING

type ConnectionContextValue = {
  connectState: ConnectState
  lib?: CurveApi
  curve?: CurveApi
  llama?: LlamaApi
  error?: unknown
  wallet?: Wallet
  provider?: BrowserProvider
}

const ConnectionContext = createContext<ConnectionContextValue>({
  connectState: LOADING,
})

/**
 * Compare the signer address of the wallet with the one in the library.
 */
const compareSignerAddress = (wallet: Wallet | undefined, lib: Libs[LibKey]) =>
  wallet?.account.address?.toLowerCase() == (lib?.signerAddress?.toLowerCase() || null)

/**
 * Separate hook to get the wallet and provider from wagmi.
 * This is moved here so that it's only used once in the context provider.
 */
function useWagmiWallet() {
  const { data: client } = useConnectorClient()
  const address = client?.account?.address
  const { isReconnecting, isConnected } = useAccount()
  return {
    // wagmi flips to isReconnecting when switching pages, but leaves isConnected as true
    isReconnecting: isReconnecting && !isConnected,
    ...(useMemo(() => {
      const wallet = address &&
        client?.transport.request && {
          provider: { request: client.transport.request },
          account: { address }, // the ensName is set later when detected
          chainId: client.chain.id,
        }
      return { wallet, provider: wallet ? new BrowserProvider(wallet.provider) : null }
    }, [address, client?.chain.id, client?.transport.request]) ?? null),
  }
}

const AppLibs: Record<AppName, LibKey> = {
  crvusd: 'llamaApi',
  dao: 'curveApi',
  dex: 'curveApi',
  lend: 'llamaApi',
}

/**
 * ConnectionProvider is a React context provider that manages the connection state of a wallet.
 * We use a context instead of a store to be able to get the initialization functions injected depending on the app.
 * todo: Merged with useWallet after wagmi migration. Get rid of apiStore after this is used everywhere.
 */
export const ConnectionProvider = <TChainId extends number, NetworkConfig extends NetworkDef>({
  network,
  onChainUnavailable,
  app,
  children,
}: {
  network: NetworkConfig | undefined
  onChainUnavailable: ([unsupportedChainId, walletChainId]: [TChainId, TChainId]) => void
  app: AppName
  children: ReactNode
}) => {
  const [connectState, setConnectState] = useState<ConnectState>(LOADING)
  const { switchChainAsync } = useSwitchChain()
  const walletChainId = useChainId()
  const { wallet, provider, isReconnecting } = useWagmiWallet()
  const isFocused = useIsDocumentFocused()
  const libKey = AppLibs[app]

  useEffect(() => {
    if (isReconnecting || !network) return // wait for wagmi to auto-reconnect
    const abort = new AbortController()
    const signal = abort.signal

    /**
     * Initialize the app by connecting to the wallet and setting up the library.
     */
    const initApp = async () => {
      const chainId = Number(network.chainId) as TChainId
      try {
        if (walletChainId && walletChainId !== chainId) {
          setConnectState(LOADING)
          if (isFocused && !(await switchChainAsync({ chainId: chainId as WagmiChainId }))) {
            if (signal.aborted) return
            setConnectState(FAILURE)
            onChainUnavailable([chainId, walletChainId as TChainId])
          }
          return // hook is called again after since it depends on walletChainId
        }

        const prevLib = libRef.get(libKey)
        if (compareSignerAddress(wallet, prevLib) && prevLib?.chainId == chainId) {
          return // already connected to the right chain and wallet, no need to reinitialize
        }

        if (signal.aborted) return
        setConnectState(LOADING)
        const newLib = await libRef.init(libKey, network, wallet?.provider)
        if (signal.aborted) return
        libRef.set(libKey, newLib)
        setConnectState(SUCCESS)
      } catch (error) {
        if (signal.aborted) return console.info('Error during init ignored', error)
        console.error('Error during init', error)
        setConnectState(FAILURE)
      }
    }
    void initApp()
    return () => abort.abort()
  }, [isReconnecting, network, libKey, onChainUnavailable, switchChainAsync, wallet, walletChainId, isFocused])

  const value = {
    connectState,
    ...(wallet && { wallet }),
    ...(provider && { provider }),
    curve: libRef.getIfOk('curveApi', network?.chainId, wallet),
    llama: libRef.getIfOk('llamaApi', network?.chainId, wallet),
  }
  return <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>
}

export const useConnection = () => useContext(ConnectionContext)

export const useHydration = <K extends LibKey>(
  libKey: K,
  hydrate: (lib: Libs[K], prevLib: Libs[K], wallet?: Wallet) => Promise<void>,
) => {
  const [hydrated, setHydrated] = useState(false)
  const { curve, llama, wallet } = useConnection()
  const prev = useRef<Libs[K]>(undefined)
  const lib = (libKey === 'curveApi' ? curve : llama) as Libs[K] // todo: make the names consistent

  useEffect(() => {
    // todo: only hydrate if not hydrated yet with this chain/signer
    const abort = new AbortController()
    void (async () => {
      try {
        setHydrated(false)
        await hydrate(lib, prev.current, wallet)
      } catch (error) {
        console.error(`Error during ${libKey} hydration`, error)
      } finally {
        if (!abort.signal.aborted) {
          setHydrated(true)
        }
      }
    })()
    return () => abort.abort()
  }, [hydrate, lib, libKey, wallet])

  useEffect(() => {
    prev.current = lib
  }, [lib])

  return hydrated
}

type Libs = {
  llamaApi?: LlamaApi
  curveApi?: CurveApi
}

type LibKey = keyof Libs

/**
 * Lib is a singleton that holds the current instance of the library.
 * It would be better to use only the context, but we need to be able to access it in the store and query functions.
 */
const libRef = {
  current: {} as Libs,
  get: <K extends LibKey>(key: K): Libs[K] | undefined => libRef.current[key],
  getIfOk: <K extends LibKey>(key: K, chainId?: number, wallet?: Wallet): Libs[K] | undefined => {
    const lib = libRef.current[key]
    // the wallet is first connected, then the callback runs. So the ref is not updated yet
    if (lib?.chainId === Number(chainId) && compareSignerAddress(wallet, lib)) {
      return lib
    }
  },
  require<K extends LibKey>(key: K): NonNullable<Libs[K]> {
    const value = libRef.get(key)
    if (!value) throw new Error(`${key} not initialized`)
    return value
  },
  set: <K extends LibKey>(key: K, lib: Libs[K]) => (libRef.current[key] = lib),
  init: async <K extends LibKey>(key: K, network: NetworkDef, externalProvider?: Eip1193Provider): Promise<Libs[K]> => {
    const { chainId } = network
    if (key === 'llamaApi') {
      if (!externalProvider) {
        return
      }
      const api = createLlamalend()
      await api.init('Web3', { network, externalProvider }, { chainId })
      return api as Libs[K]
    }
    const curveApi = createCurve()
    if (externalProvider) {
      await curveApi.init('Web3', { network, externalProvider }, { chainId })
    } else {
      await curveApi.init('NoRPC', 'NoRPC', { chainId })
    }
    return curveApi as Libs[K]
  },
}

export const getLib = libRef.get
export const requireLib = libRef.require
