import { type ReactNode, useEffect, useState } from 'react'
import { useSwitchChain } from 'wagmi'
import type { NetworkDef } from '@ui/utils'
import { ConnectionContext, useWagmiWallet } from '@ui-kit/features/connect-wallet/lib/ConnectionContext'
import {
  AppChainId,
  AppLib,
  AppLibs,
  AppNetworkId,
  ConnectState,
  HydratorMap,
} from '@ui-kit/features/connect-wallet/lib/types'
import { useIsDocumentFocused } from '@ui-kit/features/layout/utils'
import type { AppName } from '@ui-kit/shared/routes'
import { globalLibs, isWalletMatching } from './utils'
import type { WagmiChainId } from './wagmi/wagmi-config'

const { FAILURE, LOADING, HYDRATING, SUCCESS } = ConnectState

/**
 * ConnectionProvider is a React context provider that manages the connection state of a wallet.
 * We use a context instead of a store to be able to get the initialization functions injected depending on the app.
 * todo: Merged with useWallet after wagmi migration. Get rid of apiStore after this is used everywhere.
 */
export const ConnectionProvider = <App extends AppName>({
  network,
  onChainUnavailable,
  app,
  hydrate,
  children,
}: {
  /** Network configuration to connect to. */
  network: NetworkDef<AppNetworkId<App>, AppChainId<App>>
  /** Callback when the wallet is connected to an unsupported chain. */
  onChainUnavailable: ([unsupportedChainId, walletChainId]: [AppChainId<App>, AppChainId<App>]) => void
  app: App
  hydrate: HydratorMap
  children: ReactNode
}) => {
  const [connectState, setConnectState] = useState<ConnectState>(LOADING)
  const { switchChainAsync } = useSwitchChain()
  const { wallet, provider, isReconnecting } = useWagmiWallet()
  const isFocused = useIsDocumentFocused()
  const libKey = AppLibs[app]

  useEffect(() => {
    /**
     * Updates the wallet chain if the network changes or the wallet is connected to a different chain.
     * This is separate from the rest of initApp to avoid unnecessary reinitialization, as isFocused can change frequently.
     */
    async function updateWalletChain() {
      const chainId = Number(network.chainId) as AppChainId<App>
      if (wallet && wallet?.chainId !== chainId) {
        setConnectState(LOADING)
        if (isFocused && !(await switchChainAsync({ chainId: chainId as WagmiChainId }))) {
          setConnectState(FAILURE)
          onChainUnavailable([chainId, wallet?.chainId as AppChainId<App>])
        }
        return // hook is called again after since it depends on walletChainId
      }
    }
    updateWalletChain().catch((e) => {
      console.error('Error updating wallet chain', e)
      setConnectState(FAILURE)
    })
  }, [isFocused, network.chainId, onChainUnavailable, switchChainAsync, wallet])

  useEffect(() => {
    if (isReconnecting) return // wait for wagmi to auto-reconnect
    const abort = new AbortController()
    const signal = abort.signal

    /** Initialize the app by hydrating the library if needed. */
    const hydrateApp = async (lib: AppLib<App>, prevLib?: AppLib<App>) => {
      if (globalLibs.hydrated[app] != lib && hydrate[app]) {
        setConnectState(HYDRATING)
        await hydrate[app](lib, prevLib, wallet) // if thrown, it will be caught in initLib
      }
      globalLibs.hydrated[app] = lib as (typeof globalLibs.hydrated)[App]
      setConnectState(SUCCESS)
    }

    /**
     * Initialize the app by connecting to the wallet and setting up the library.
     */
    const initLib = async () => {
      const chainId = Number(network.chainId) as AppChainId<App>
      try {
        if (wallet && wallet?.chainId !== chainId) {
          return // wait for the wallet to be connected to the right chain
        }

        const prevLib = globalLibs.get(libKey)
        if (isWalletMatching(wallet, prevLib, chainId)) {
          return await hydrateApp(prevLib) // already connected to the right chain and wallet, no need to reinitialize
        }

        if (signal.aborted) return
        setConnectState(LOADING)
        console.info(
          `Initializing ${libKey} for ${network.name} (${network.chainId})`,
          wallet ? `Wallet ${wallet?.account?.address} with chain ${wallet?.chainId}` : 'without wallet',
          prevLib
            ? `Old library had ${prevLib.signerAddress ? `signer ${prevLib.signerAddress}` : 'no signer'} with chain ${prevLib.chainId}`
            : `First initialization`,
        )
        const newLib = await globalLibs.init(libKey, network, wallet?.provider)

        if (signal.aborted) return
        globalLibs.set(libKey, newLib)
        await hydrateApp(newLib, prevLib)
      } catch (error) {
        if (signal.aborted) return console.info('Error during init ignored', error)
        console.error('Error during init', error)
        setConnectState(FAILURE)
      }
    }
    void initLib()
    return () => abort.abort()
  }, [app, hydrate, isReconnecting, libKey, network, wallet])

  // the following statements are skipping the render cycle, only update the libs when connectState changes too!
  const curveApi = globalLibs.getMatching('curveApi', wallet, network?.chainId)
  const llamaApi = globalLibs.getMatching('llamaApi', wallet, network?.chainId)
  const isHydrated = !!globalLibs.hydrated[app] && { curveApi, llamaApi }[libKey] === globalLibs.hydrated[app]

  return (
    <ConnectionContext.Provider
      value={{
        connectState,
        network,
        isHydrated,
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
