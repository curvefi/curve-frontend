import { ethers } from 'ethers'
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { getWalletChainId, getWalletSignerAddress, useSetChain, useWallet } from '@ui-kit/features/connect-wallet'
import { WalletNameStorageKey } from '@ui-kit/features/connect-wallet/lib/hooks'
import { withTimeout } from '@ui-kit/features/connect-wallet/lib/utils/wallet-helpers'
import { getFromLocalStorage, setLocalStorage } from '@ui-kit/hooks/useLocalStorage'
import type { WalletState as Wallet } from '@web3-onboard/core'

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
  error?: unknown
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
  hydrate: (newLib: TLib | null, prevLib: TLib | null, wallet: Wallet | null) => Promise<void>
  initLib: (chainId: TChainId, wallet: Wallet | null) => Promise<TLib | undefined>
  chainId: TChainId
  onChainUnavailable: ([unsupportedChainId, walletChainId]: [TChainId, TChainId]) => void
  children: ReactNode
}) => {
  const [connectState, setConnectState] = useState<ConnectState>({ status: LOADING })
  const isWalletInitialized = useRef(false)
  const { wallet, connect } = useWallet()
  const [_, setChain] = useSetChain()

  useEffect(() => {
    if (isWalletInitialized.current) {
      setLocalStorage(WalletNameStorageKey, wallet?.label ?? null)
    }
  }, [wallet])

  useEffect(() => {
    const abort = new AbortController()
    const signal = abort.signal

    /**
     * Try to reconnect to the wallet if it was previously connected, based on the stored wallet name.
     */
    const tryToReconnect = async (label: string) => {
      setConnectState({ status: LOADING, stage: CONNECT_WALLET }) // TODO: this status is not being set when connecting manually
      return withTimeout(connect({ autoSelect: { label, disableModals: true } }))
        .then((wallets) => wallets.length > 0)
        .catch(() => false)
    }

    /**
     * Initialize the app by connecting to the wallet and setting up the library.
     */
    const initApp = async () => {
      try {
        if (!isWalletInitialized.current) {
          isWalletInitialized.current = true
          const storedWalletName = getFromLocalStorage<string>(WalletNameStorageKey) // todo: get rid of walletName with wagmi
          if (storedWalletName && (await tryToReconnect(storedWalletName))) {
            return // wallet updated, callback is restarted
          }
        }

        const walletChainId = getWalletChainId(wallet)
        if (walletChainId && walletChainId !== chainId) {
          setConnectState({ status: LOADING, stage: SWITCH_NETWORK })
          if (!(await setChain({ chainId: ethers.toQuantity(chainId) }))) {
            if (signal.aborted) return
            setConnectState({ status: FAILURE, stage: SWITCH_NETWORK })
            onChainUnavailable([chainId, walletChainId as TChainId])
          }
        }

        const prevLib = libRef.get<TLib>()
        let newLib = prevLib
        if (!libRef.get() || !compareSignerAddress(wallet, prevLib)) {
          if (signal.aborted) return
          setConnectState({ status: LOADING, stage: CONNECT_API })
          newLib = (await initLib(chainId, wallet)) ?? null

          if (signal.aborted) return
          libRef.set(newLib)
        }

        if (signal.aborted) return
        setConnectState({ status: SUCCESS, stage: HYDRATE })
        await hydrate(newLib, prevLib, wallet)
        setConnectState({ status: SUCCESS })
      } catch (error) {
        if (signal.aborted) {
          console.info(error)
          return
        }
        console.error(error)
        setConnectState(({ stage }) => ({ status: FAILURE, stage, error }))
      }
    }
    void initApp()
    return () => abort.abort()
  }, [isWalletInitialized, chainId, connect, hydrate, initLib, onChainUnavailable, setChain, wallet])

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
