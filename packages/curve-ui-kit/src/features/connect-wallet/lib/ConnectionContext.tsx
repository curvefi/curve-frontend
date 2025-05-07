import { type Eip1193Provider } from 'ethers'
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'
import {
  getWalletChainId,
  getWalletSignerAddress,
  useSetChain,
  useWallet,
  type Wallet,
} from '@ui-kit/features/connect-wallet'
import { withTimeout } from '@ui-kit/features/connect-wallet/lib/utils/wallet-helpers'
import { useWalletName } from '@ui-kit/hooks/useLocalStorage'

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
const { HYDRATE, SWITCH_NETWORK, CONNECT_WALLET, CONNECT_API } = CONNECT_STAGE

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
) => !wallet || getWalletSignerAddress(wallet)?.toLowerCase() == lib?.signerAddress?.toLowerCase()

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
 * which is not only unnecessary, it is also not supported and can cause unintentional side-effects like
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
  const [isReconnecting, setIsReconnecting] = useState<boolean | null>(null)
  const { wallet, connect } = useWallet()
  const [walletName, setWalletName] = useWalletName()
  const setChain = useSetChain()

  useEffect(() => {
    if (wallet) {
      // update the wallet name so that onboard can use it for reconnecting
      setWalletName(wallet.label ?? null)
    }
  }, [setWalletName, wallet])

  // make sure the ref is reset when the component is unmounted, so it doesn't get used in the wrong app
  useEffect(() => () => libRef.reset(), [])

  useEffect(() => {
    const abort = new AbortController()
    const signal = abort.signal

    /**
     * Try to reconnect to the wallet if it was previously connected, based on the stored wallet name.
     */
    const tryToReconnect = async (label: string | null) => {
      setIsReconnecting(!!label)
      if (!label) return
      setConnectState({ status: LOADING, stage: CONNECT_WALLET }) // TODO: this status is not being set when connecting manually
      return withTimeout(connect(label))
        .then((wallet) => !!wallet)
        .catch(() => false)
        .finally(() => setIsReconnecting(false))
    }

    /**
     * Initialize the app by connecting to the wallet and setting up the library.
     */
    const initApp = async () => {
      try {
        if (isReconnecting === null && (await tryToReconnect(walletName))) {
          return // wallet updated, callback is restarted
        }

        const walletChainId = getWalletChainId(wallet)
        const isFocused = document.hasFocus() // only change chains on focused tab, so they don't fight each other
        if (walletChainId && walletChainId !== chainId && isFocused) {
          setConnectState({ status: LOADING, stage: SWITCH_NETWORK })
          if (!(await setChain(chainId))) {
            if (signal.aborted) return
            setConnectState({ status: FAILURE, stage: SWITCH_NETWORK })
            return onChainUnavailable([chainId, walletChainId as TChainId])
          }
        }

        await withMutex(async () => {
          const prevLib = libRef.get<TLib>()
          let newLib = prevLib

          if (!compareSignerAddress(wallet, prevLib) || prevLib?.chainId != chainId) {
            if (signal.aborted) return
            setConnectState({ status: LOADING, stage: CONNECT_API })
            newLib = (await initLib(chainId, wallet?.provider)) ?? null

            if (signal.aborted) return
            libRef.set(newLib)
          }

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
    if (!isReconnecting) void initApp()
    return () => abort.abort()
  }, [chainId, hydrate, initLib, onChainUnavailable, setChain, wallet, walletName, connect, isReconnecting])

  const lib = libRef.get<TLib>()
  // the wallet is first connected, then the callback runs. So the ref is not updated yet
  const isLibOk = lib?.chainId === chainId && compareSignerAddress(wallet, lib)

  return (
    <ConnectionContext.Provider value={{ connectState, ...(isLibOk && { lib }) }}>
      {children}
    </ConnectionContext.Provider>
  )
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
