import { type Eip1193Provider } from 'ethers'
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from 'react'
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

type ConnectionContextValue<TLib> = {
  connectState: ConnectState
  lib?: TLib
}

const ConnectionContext = createContext<ConnectionContextValue<unknown>>({
  connectState: { status: LOADING },
})

const compareSignerAddress = <TChainId extends any>(
  wallet: Wallet | null,
  lib: { chainId: TChainId; signerAddress?: string } | null,
) => getWalletSignerAddress(wallet)?.toLowerCase() == lib?.signerAddress?.toLowerCase()

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
  hydrate: (newLib: TLib, prevLib: TLib | null, wallet: Wallet | null) => Promise<void>
  initLib: (chainId: TChainId, provider?: Eip1193Provider) => Promise<TLib>
  chainId: TChainId
  onChainUnavailable: ([unsupportedChainId, walletChainId]: [TChainId, TChainId]) => void
  children: ReactNode
}) => {
  const [connectState, setConnectState] = useState<ConnectState>({ status: LOADING })
  const isWalletInitialized = useRef(false)
  const { wallet, connect } = useWallet()
  const [walletName, setWalletName] = useWalletName()
  const setChain = useSetChain()

  useEffect(() => {
    if (isWalletInitialized.current) {
      setWalletName(wallet?.label ?? null)
    }
  }, [setWalletName, wallet])

  useEffect(() => {
    const abortController = new AbortController()

    /**
     * Try to reconnect to the wallet if it was previously connected, based on the stored wallet name.
     */
    const tryToReconnect = async (label: string) => {
      setConnectState({ status: LOADING, stage: CONNECT_WALLET }) // TODO: this status is not being set when connecting manually
      isWalletInitialized.current = true
      return withTimeout(connect(label))
        .then((wallet) => !!wallet)
        .catch(() => false)
    }

    /**
     * Initialize the app by connecting to the wallet and setting up the library.
     */
    const initApp = async () => {
      try {
        if (!isWalletInitialized.current) {
          if (walletName && (await tryToReconnect(walletName))) {
            return // wallet updated, callback is restarted
          }
        }

        const walletChainId = getWalletChainId(wallet)
        if (walletChainId && walletChainId !== chainId) {
          setConnectState({ status: LOADING, stage: SWITCH_NETWORK })
          if (!(await setChain(chainId))) {
            if (abortController.signal.aborted) return
            setConnectState({ status: FAILURE, stage: SWITCH_NETWORK })
            onChainUnavailable([chainId, walletChainId as TChainId])
          }
        }

        const prevLib = libRef.get<TLib>()
        if (!libRef.get() || !compareSignerAddress(wallet, prevLib)) {
          if (abortController.signal.aborted) return
          setConnectState({ status: LOADING, stage: CONNECT_API })
          const newLib = await initLib(chainId, wallet?.provider)

          if (abortController.signal.aborted) return
          libRef.set(newLib)
        }

        if (abortController.signal.aborted) return
        setConnectState({ status: SUCCESS, stage: HYDRATE })
        await hydrate(libRef.require<TLib>(), prevLib, wallet)
        setConnectState({ status: SUCCESS })
      } catch (error) {
        console.error(error)
        if (abortController.signal.aborted) return
        setConnectState(({ stage }) => ({ status: FAILURE, stage }))
      }
    }
    void initApp()
    return () => abortController.abort()
    // Adding connect to the list of deps somehow causes an infinite loop, not sure why
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWalletInitialized, chainId, hydrate, initLib, onChainUnavailable, setChain, wallet, walletName])

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
  require: <T = unknown,>() => {
    if (!libRef.current) throw new Error('Lib not initialized')
    return libRef.current as T
  },
  set: <T extends unknown>(newLib: T) => (libRef.current = newLib),
}

export const getLib = <TLib extends unknown>() => libRef.get<TLib>()
export const requireLib = <TLib extends unknown>() => libRef.require<TLib>()
