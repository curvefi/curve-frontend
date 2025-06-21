'use client'
import { BrowserProvider } from 'ethers'
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react'
import { useAccount, useChainId, useConnectorClient, useSwitchChain } from 'wagmi'
import type { NetworkDef } from '@ui/utils'
import { AppLibs, globalLibs, isWalletMatching } from '@ui-kit/features/connect-wallet/lib/utils'
import { useIsDocumentFocused } from '@ui-kit/features/layout/utils'
import type { AppName } from '@ui-kit/shared/routes'
import { ConnectState, type CurveApi, type LlamaApi, type Wallet } from './types'
import { type WagmiChainId } from './wagmi/wagmi-config'

const { FAILURE, LOADING, SUCCESS } = ConnectState

export const isSuccess = (status: ConnectState) => status === SUCCESS
export const isFailure = (status: ConnectState) => status === FAILURE
export const isLoading = (status: ConnectState) => status === LOADING

type ConnectionContextValue = {
  connectState: ConnectState
  curveApi?: CurveApi
  llamaApi?: LlamaApi
  error?: unknown
  wallet?: Wallet
  provider?: BrowserProvider
  network?: NetworkDef
}

const ConnectionContext = createContext<ConnectionContextValue>({
  connectState: LOADING,
})

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

        const prevLib = globalLibs.get(libKey)
        if (isWalletMatching(wallet, prevLib, chainId)) {
          setConnectState(SUCCESS)
          return // already connected to the right chain and wallet, no need to reinitialize
        }

        if (signal.aborted) return
        setConnectState(LOADING)
        const newLib = await globalLibs.init(libKey, network, wallet?.provider)
        if (signal.aborted) return
        globalLibs.set(libKey, newLib)
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

  const curveApi = globalLibs.getMatching('curveApi', wallet, network?.chainId)
  const llamaApi = globalLibs.getMatching('llamaApi', wallet, network?.chainId)
  return (
    <ConnectionContext.Provider
      value={{
        connectState,
        network,
        ...(wallet && { wallet }),
        ...(provider && { provider }),
        ...(curveApi && { curveApi }),
        ...(llamaApi && { llamaApi }),
      }}
    >
      {children}
    </ConnectionContext.Provider>
  )
}

export const useConnection = () => useContext(ConnectionContext)
