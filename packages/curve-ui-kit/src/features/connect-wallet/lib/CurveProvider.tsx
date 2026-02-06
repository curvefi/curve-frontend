import { type ReactNode, useEffect, useState } from 'react'
import { useChainId, useSwitchChain, useConfig } from 'wagmi'
import type { NetworkDef } from '@ui/utils'
import { CurveContext, useWagmiWallet } from '@ui-kit/features/connect-wallet/lib/CurveContext'
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

const { FAILURE, LOADING, HYDRATING, SUCCESS } = ConnectState

/**
 * ConnectionProvider is a React context provider that manages the connection state of a wallet.
 * We use a context instead of a store to be able to get the initialization functions injected depending on the app.
 * todo: Merged with useWallet after wagmi migration. Get rid of apiStore after this is used everywhere.
 */
export const CurveProvider = <App extends AppName>({
  network,
  onChainUnavailable,
  app,
  hydrate,
  children,
}: {
  /** Network configuration to connect to. */
  network: NetworkDef<AppNetworkId<App>, AppChainId<App>> | undefined // network can be undefined while loading or on the root
  /** Callback when the wallet is connected to an unsupported chain. */
  onChainUnavailable: (walletChainId?: number) => void
  app: App
  hydrate: HydratorMap
  children: ReactNode
}) => {
  const [connectState, setConnectState] = useState<ConnectState>(LOADING)
  const walletChainId = useChainId()
  const { mutateAsync: switchChainAsync } = useSwitchChain()
  const { wallet, provider, isReconnecting } = useWagmiWallet()
  const isFocused = useIsDocumentFocused()
  const libKey = AppLibs[app]
  const config = useConfig()

  useEffect(() => {
    /**
     * Checks the wallet chain if the network changes or the wallet is connected to a different chain.
     * Separate from the heavier `initApp` because `isFocused` changes often.
     */
    if (isReconnecting) return // wait for wagmi to auto-reconnect
    if (!network) return onChainUnavailable(walletChainId) // will redirect to the wallet's chain if supported
    if (network.chainId == walletChainId) return // all good
    if (isFocused) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConnectState(LOADING)
      switchChainAsync({ chainId: network.chainId }).catch((e) => {
        console.error(`Error updating wallet chain from ${walletChainId} to ${network.chainId}`, e)
        setConnectState(FAILURE)
      })
    }
  }, [isFocused, isReconnecting, walletChainId, network, onChainUnavailable, switchChainAsync, wallet])

  useEffect(() => {
    if (isReconnecting) return // wait for wagmi to auto-reconnect
    const abort = new AbortController()
    const signal = abort.signal

    /** Initialize the app by hydrating the library if needed. */
    const hydrateApp = async (lib: AppLib<App>, prevLib?: AppLib<App>) => {
      if (globalLibs.hydrated[app] != lib && hydrate[app]) {
        setConnectState(HYDRATING)
        await hydrate[app](config, lib, prevLib, wallet) // if thrown, it will be caught in initLib
      }
      globalLibs.hydrated[app] = lib as (typeof globalLibs.hydrated)[App]
      setConnectState(SUCCESS)
    }

    /**
     * Initialize the app by connecting to the wallet and setting up the library.
     */
    const initLib = async () => {
      if (!network) return
      try {
        if (walletChainId != network.chainId) {
          return // wait for the wallet to be connected to the right chain or for the redirect to take effect
        }

        const prevLib = globalLibs.get(libKey)
        if (isWalletMatching(wallet, prevLib, network.chainId)) {
          return await hydrateApp(prevLib) // already connected to the right chain and wallet, no need to reinitialize
        }

        if (signal.aborted) return
        setConnectState(LOADING)
        const newLib = await globalLibs.init(libKey, network, wallet?.provider)
        if (!newLib) return
        console.info(
          `Initialized ${libKey} for ${network.name} (${network.chainId})`,
          wallet ? `Wallet ${wallet?.address} with chain ${walletChainId}` : 'without wallet',
          prevLib
            ? `Old library had ${prevLib.signerAddress ? `signer ${prevLib.signerAddress}` : 'no signer'} with chain ${prevLib.chainId}`
            : `First initialization`,
        )

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
  }, [app, config, hydrate, isReconnecting, libKey, network, wallet, walletChainId])

  // the following statements are skipping the render cycle, only update the libs when connectState changes too!
  const curveApi = globalLibs.getMatching('curveApi', wallet, network?.chainId)
  const llamaApi = globalLibs.getMatching('llamaApi', wallet, network?.chainId)
  const isHydrated = !!globalLibs.hydrated[app] && { curveApi, llamaApi }[libKey] === globalLibs.hydrated[app]

  return (
    <CurveContext.Provider
      value={{
        connectState,
        network,
        isHydrated,
        isReconnecting,
        ...(wallet && { wallet }),
        ...(provider && { provider }),
        ...(curveApi && { curveApi }),
        ...(llamaApi && { llamaApi }),
      }}
    >
      {children}
    </CurveContext.Provider>
  )
}
