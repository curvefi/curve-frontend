'use client'
import { BrowserProvider, type Eip1193Provider } from 'ethers'
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { useAccount, useChainId, useConnectorClient, useSwitchChain } from 'wagmi'
import { type Wallet } from '@ui-kit/features/connect-wallet'
import type { WagmiChainId } from './wagmi/chains'

const CONNECT_STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  FAILURE: 'failure',
}

export const CONNECT_STAGE = {
  CONNECT_API: 'api',
  HYDRATE: 'hydrate',
  CONNECT_WALLET: 'connect-wallet',
  DISCONNECT_WALLET: 'disconnect-wallet',
  SWITCH_NETWORK: 'switch-network',
} as const

type ConnectState = {
  status: (typeof CONNECT_STATUS)[keyof typeof CONNECT_STATUS]
  stage?: (typeof CONNECT_STAGE)[keyof typeof CONNECT_STAGE]
}

const { FAILURE, LOADING, SUCCESS } = CONNECT_STATUS
const { HYDRATE, SWITCH_NETWORK, CONNECT_API } = CONNECT_STAGE

export const isSuccess = (connectState: ConnectState) => connectState.status === SUCCESS

export const isFailure = ({ status, stage: connectionStage }: ConnectState, expectedStage?: string) =>
  status === FAILURE && Boolean(!expectedStage || connectionStage?.startsWith(expectedStage))

export const isLoading = ({ status, stage: connectionStage }: ConnectState, expectedStage?: string | string[]) =>
  status === LOADING &&
  Boolean(
    !expectedStage ||
      (Array.isArray(expectedStage)
        ? expectedStage.some((s) => connectionStage?.startsWith(s))
        : connectionStage?.startsWith(expectedStage)),
  )

/** During hydration the status is success and the stage is set to hydrate. */
export const isHydrated = ({ status, stage }: ConnectState) => status === SUCCESS && stage !== HYDRATE

type ConnectionContextValue<TLib> = {
  connectState: ConnectState
  lib?: TLib
  error?: unknown
  wallet?: Wallet
  provider?: BrowserProvider
}

const ConnectionContext = createContext<ConnectionContextValue<unknown>>({
  connectState: { status: LOADING },
})

/**
 * Compare the signer address of the wallet with the one in the library. Without wallet, returns true.
 */
const compareSignerAddress = <TChainId extends any>(
  wallet: Wallet | null,
  lib: { chainId: TChainId; signerAddress?: string } | null,
) => !wallet || wallet.account?.address?.toLowerCase() == lib?.signerAddress?.toLowerCase()

/** Module-level variables to track initialization state across multiple calls */
let mutexPromise: Promise<unknown> | null = null
let mutexKey: any | null = null

/**
 * Ensures that initialization functions are executed in a controlled sequence,
 * preventing race conditions when multiple initialization requests occur.
 *
 * This function implements a mutex pattern that handles concurrent initialization
 * requests by ensuring only the most recent request is processed when multiple
 * calls happen in quick succession:
 *
 * 1. If a call comes in while another is in progress, it waits for the current one to finish
 * 2. After waiting, it checks if the key has changed during the wait
 * 3. If the key has changed, it returns the existing promise (skipping execution for outdated keys)
 * 4. If no other operation is in progress, it executes the function and cleans up when done
 *
 * Primary reason for this function is to avoid simultaneous CurveJS library instantiations,
 * which is not only unnecessary, it is also not supported and can cause unintentional side effects like
 * duplicate mint markets for crvUSD.
 *
 * @param fn - The function to execute with mutex protection
 * @param key - A value used to identify this specific operation
 * @returns A promise that resolves with the result of the function execution
 */
async function withMutex(fn: () => Promise<any>, key: unknown) {
  mutexKey = key

  if (mutexPromise) {
    await mutexPromise

    if (mutexKey !== key) {
      return mutexPromise
    }

    mutexPromise = null
  }

  mutexKey = null

  mutexPromise = fn().finally(() => {
    mutexPromise = null
  })

  return mutexPromise
}

function useIsDocumentFocused() {
  const [isFocused, setIsFocused] = useState(document.hasFocus()) // only change chains on focused tab, so they don't fight each other
  useEffect(() => {
    const interval = setInterval(() => setIsFocused(document.hasFocus()), 300)
    return () => clearInterval(interval)
  }, [])
  return isFocused
}

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
      const wallet =
        address && client?.transport.request
          ? {
              provider: { request: client.transport.request },
              account: { address }, // the ensName is set later when detected
              chainId: client.chain.id,
            }
          : null
      return { wallet, provider: wallet ? new BrowserProvider(wallet.provider) : null }
    }, [address, client?.chain.id, client?.transport.request]) ?? null),
  }
}

/**
 * ConnectionProvider is a React context provider that manages the connection state of a wallet.
 * We use a context instead of a store to be able to get the initialization functions injected depending on the app.
 * todo: Merged with useWallet after wagmi migration. Get rid of apiStore after this is used everywhere.
 */
export const ConnectionProvider = <
  TChainId extends number,
  TLib extends { chainId: TChainId; signerAddress?: string },
>({
  hydrate,
  initLib,
  chainId,
  onChainUnavailable,
  children,
}: {
  hydrate: (newLib: TLib | null, prevLib: TLib | null, wallet: Wallet | null) => Promise<void>
  initLib: (chainId: TChainId, provider?: Eip1193Provider) => Promise<TLib | undefined>
  chainId: TChainId
  onChainUnavailable: ([unsupportedChainId, walletChainId]: [TChainId, TChainId]) => void
  children: ReactNode
}) => {
  const [connectState, setConnectState] = useState<ConnectState>({ status: LOADING })
  const { switchChainAsync } = useSwitchChain()
  const walletChainId = useChainId()
  const { wallet, provider, isReconnecting } = useWagmiWallet()
  const isFocused = useIsDocumentFocused()

  useEffect(() => {
    if (isReconnecting) return // wait for wagmi to auto-reconnect
    const abort = new AbortController()
    const signal = abort.signal

    /**
     * Initialize the app by connecting to the wallet and setting up the library.
     */
    const initApp = async () => {
      try {
        if (walletChainId && walletChainId !== chainId) {
          setConnectState({ status: LOADING, stage: SWITCH_NETWORK })
          if (isFocused && !(await switchChainAsync({ chainId: chainId as WagmiChainId }))) {
            if (signal.aborted) return
            setConnectState({ status: FAILURE, stage: SWITCH_NETWORK })
            onChainUnavailable([chainId, walletChainId as TChainId])
          }
          return // hook is called again after since it depends on walletChainId
        }

        const prevLib = libRef.get<TLib>()
        if (compareSignerAddress(wallet, prevLib) && prevLib?.chainId == chainId) {
          return // already connected to the right chain and wallet, no need to reinitialize
        }

        await withMutex(async () => {
          if (signal.aborted) return
          setConnectState({ status: LOADING, stage: CONNECT_API })
          const newLib = (await initLib(chainId, wallet?.provider)) ?? null
          if (signal.aborted) return
          libRef.set(newLib)
          if (signal.aborted) return
          setConnectState({ status: SUCCESS, stage: HYDRATE })
          await hydrate(newLib, prevLib, wallet)
        }, [chainId, wallet])

        setConnectState({ status: SUCCESS })
      } catch (error) {
        if (signal.aborted) return console.info('Error during init ignored', error)
        console.error('Error during init', error)
        setConnectState(({ stage }) => ({ status: FAILURE, stage, error }))
      }
    }
    void initApp()
    return () => abort.abort()
  }, [
    isReconnecting,
    chainId,
    hydrate,
    initLib,
    onChainUnavailable,
    switchChainAsync,
    wallet,
    walletChainId,
    isFocused,
  ])

  const lib = libRef.get<TLib>()
  // the wallet is first connected, then the callback runs. So the ref is not updated yet
  const isLibOk = lib?.chainId === chainId && compareSignerAddress(wallet, lib)

  const value = {
    connectState,
    ...(wallet && { wallet }),
    ...(provider && { provider }),
    ...(isLibOk && { lib }),
  } satisfies ConnectionContextValue<TLib>
  return <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>
}

export const useConnection = <TLib extends unknown>() => useContext(ConnectionContext) as ConnectionContextValue<TLib>

/**
 * Lib is a singleton that holds the current instance of the library.
 * It would be better to use only the context, but we need to be able to access it in the store and query functions.
 */
const libRef = {
  current: null as unknown,
  get: <T = unknown,>() => libRef.current as T | null,
  require<T = unknown>() {
    if (!libRef.current) throw new Error('Lib not initialized')
    return libRef.current as T
  },
  set: <T extends unknown>(newLib: T) => (libRef.current = newLib),
  reset() {
    libRef.set(null)
  },
}

export const getLib = <TLib extends unknown>() => libRef.get<TLib>()
export const requireLib = <TLib extends unknown>() => libRef.require<TLib>()
