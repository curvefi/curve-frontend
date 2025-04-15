import { ethers } from 'ethers'
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { getWalletChainId, getWalletSignerAddress, useSetChain, useWallet } from '@ui-kit/features/connect-wallet'
import { WalletNameStorageKey } from '@ui-kit/features/connect-wallet/lib/hooks'
import { withTimeout } from '@ui-kit/features/connect-wallet/lib/utils/wallet-helpers'
import { getFromLocalStorage, setLocalStorage } from '@ui-kit/hooks/useLocalStorage'
import type { WalletState as Wallet } from '@web3-onboard/core'

export const CONNECT_STATUS = {
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

export type ConnectStage = (typeof CONNECT_STAGE)[keyof typeof CONNECT_STAGE]
export type ConnectStatus = (typeof CONNECT_STATUS)[keyof typeof CONNECT_STATUS]

export type ConnectState = {
  status: ConnectStatus
  stage?: ConnectStage
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
  lib: TLib | null
}

const ConnectionContext = createContext<ConnectionContextValue<unknown>>({
  connectState: { status: LOADING },
  lib: null,
})

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
  const { wallet, connect } = useWallet()
  const [_, setChain] = useSetChain()

  const walletRef = useRef(wallet) // use ref to avoid re-rendering on wallet change
  walletRef.current = wallet

  const walletChainId = getWalletChainId(wallet)
  const walletSignerAddress = getWalletSignerAddress(wallet)
  const walletLabel = wallet?.label

  useEffect(() => {
    const abortController = new AbortController()
    const walletName = getFromLocalStorage<string>(WalletNameStorageKey) // todo: we might not need the walletName at all in useWallet

    const connectWalletStage = async () => {
      let wallet = walletRef.current
      if (walletLabel != walletName) {
        const connectOptions = { ...(walletName && { autoSelect: { label: walletName, disableModals: true } }) }
        ;[wallet] = await withTimeout(connect(connectOptions))
        setLocalStorage(WalletNameStorageKey, wallet?.label ?? null)
      }
      return wallet
    }

    const initApp = async () => {
      try {
        setConnectState({ status: LOADING, stage: CONNECT_WALLET })
        const wallet = await connectWalletStage()
        if (abortController.signal.aborted) return

        if (walletChainId && walletChainId !== chainId) {
          setConnectState({ status: LOADING, stage: SWITCH_NETWORK })
          if (!(await setChain({ chainId: ethers.toQuantity(chainId) }))) {
            if (abortController.signal.aborted) return
            setConnectState({ status: FAILURE, stage: SWITCH_NETWORK })
            onChainUnavailable([chainId, walletChainId as TChainId])
          }
        }

        const prevLib = libRef.get<TLib>()
        if (!libRef.get() || walletSignerAddress != prevLib?.signerAddress) {
          if (abortController.signal.aborted) return
          setConnectState({ status: LOADING, stage: CONNECT_API })
          const newLib = await initLib(chainId, wallet)
          if (abortController.signal.aborted) return
          libRef.set(newLib)
        }

        if (abortController.signal.aborted) return
        setConnectState({ status: SUCCESS, stage: HYDRATE })
        await hydrate(libRef.get<TLib>(), prevLib, wallet)

        if (abortController.signal.aborted) return
        setConnectState({ status: SUCCESS })
      } catch (error) {
        console.error(error)
        if (abortController.signal.aborted) return
        setConnectState(({ stage }) => ({ status: FAILURE, stage }))
      }
    }
    void initApp()
    return () => abortController.abort()
  }, [
    chainId,
    connect,
    hydrate,
    initLib,
    onChainUnavailable,
    walletChainId,
    walletLabel,
    walletSignerAddress,
    setChain,
  ])

  return (
    <ConnectionContext.Provider value={{ connectState, lib: libRef.get<TLib>() }}>
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
