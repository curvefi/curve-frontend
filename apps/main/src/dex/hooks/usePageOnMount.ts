import type { Location, NavigateFunction, Params } from 'react-router'
import type { ConnectState } from '@ui/utils'
import { isFailure, isLoading, isSuccess } from '@ui/utils'
import type { INetworkName } from '@curvefi/api/lib/interfaces'

import { ethers } from 'ethers'
import { useCallback, useEffect } from 'react'
import {
  getWalletChainId,
  getWalletSignerAddress,
  useSetChain,
  useSetLocale,
  useWallet,
} from '@ui-kit/features/connect-wallet'

import { CONNECT_STAGE, REFRESH_INTERVAL, ROUTE } from '@/dex/constants'
import { dynamicActivate, updateAppLocale } from '@ui-kit/lib/i18n'
import { useNetworkFromUrl, useParsedParams } from '@/dex/utils/utilsRouter'
import { initCurveJs } from '@/dex/utils/utilsCurvejs'
import useStore from '@/dex/store/useStore'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { ChainId, PageProps, Wallet } from '@/dex/types/main.types'

function usePageOnMount(params: Params, location: Location, navigate: NavigateFunction, chainIdNotRequired?: boolean) {
  const { wallet, connect, disconnect, walletName, setWalletName } = useWallet()
  const [_, setChain] = useSetChain()
  const updateWalletLocale = useSetLocale()

  const curve = useStore((state) => state.curve)
  const connectState = useStore((state) => state.connectState)
  const setNetworkConfigs = useStore((state) => state.networks.setNetworkConfigs)
  const updateConnectState = useStore((state) => state.updateConnectState)
  const updateCurveJs = useStore((state) => state.updateCurveJs)
  const updateGlobalStoreByKey = useStore((state) => state.updateGlobalStoreByKey)
  const networks = useStore((state) => state.networks.networks)
  const networksIdMapper = useStore((state) => state.networks.networksIdMapper)
  const { rChainId } = useNetworkFromUrl()

  const setLocale = useUserProfileStore((state) => state.setLocale)

  const walletChainId = getWalletChainId(wallet)
  const walletSignerAddress = getWalletSignerAddress(wallet)
  const parsedParams = useParsedParams(params, chainIdNotRequired)

  const handleConnectCurveApi = useCallback(
    async (options: ConnectState['options']) => {
      if (options) {
        try {
          const [chainId, useWallet] = options
          const prevCurveApi = curve
          updateGlobalStoreByKey('isLoadingApi', true)
          updateGlobalStoreByKey('isLoadingCurve', true) // remove -> use connectState

          if (chainId) {
            const api = await initCurveJs(chainId, (useWallet && wallet) || undefined)
            setNetworkConfigs(api)
            updateCurveJs(api, prevCurveApi, wallet)
            updateConnectState('success', '')
          } else {
            updateConnectState('', '')
          }
        } catch (error) {
          console.error('Failed to connect to network', error)
          updateConnectState('failure', CONNECT_STAGE.CONNECT_API)
        }
      }
    },
    [curve, updateConnectState, updateCurveJs, updateGlobalStoreByKey, setNetworkConfigs, wallet],
  )

  const handleConnectWallet = useCallback(
    async (options: ConnectState['options']) => {
      if (options) {
        const [walletName] = options
        let walletState: Wallet | null

        if (walletName) {
          // If found label in localstorage, after 30s if not connected, reconnect with modal
          const walletStatesPromise = new Promise<Wallet[] | null>(async (resolve, reject) => {
            try {
              const walletStates = await Promise.race([
                connect({ autoSelect: { label: walletName, disableModals: true } }),
                new Promise<never>((_, reject) =>
                  setTimeout(() => reject(new Error('timeout connect wallet')), REFRESH_INTERVAL['3s']),
                ),
              ])
              resolve(walletStates)
            } catch (error) {
              reject(error)
            }
          })

          try {
            const walletStates = await walletStatesPromise
            if (!walletStates || (Array.isArray(walletStates) && walletStates.length === 0))
              throw new Error('unable to connect')
            walletState = walletStates[0]
          } catch (error) {
            // if failed to get walletState due to timeout, show connect modal.
            setWalletName(null)
            ;[walletState] = await connect()
          }
        } else {
          ;[walletState] = await connect()
        }

        try {
          if (!walletState) throw new Error('unable to connect')
          setWalletName(walletState.label)
          const walletChainId = getWalletChainId(walletState)
          if (walletChainId && walletChainId !== parsedParams.rChainId) {
            const success = await setChain({ chainId: ethers.toQuantity(parsedParams.rChainId) })
            if (success) {
              updateConnectState('loading', CONNECT_STAGE.CONNECT_API, [parsedParams.rChainId, true])
            } else {
              const foundNetwork = networks[walletChainId as ChainId]?.id
              if (foundNetwork) {
                navigate(`${parsedParams.rLocalePathname}/${foundNetwork}/${parsedParams.restFullPathname}`)
                updateConnectState('loading', CONNECT_STAGE.CONNECT_API, [walletChainId, true])
              } else {
                updateConnectState('failure', CONNECT_STAGE.SWITCH_NETWORK)
              }
            }
          } else {
            updateConnectState('loading', CONNECT_STAGE.CONNECT_API, [parsedParams.rChainId, true])
          }
        } catch (error) {
          updateConnectState('loading', CONNECT_STAGE.CONNECT_API, [parsedParams.rChainId, false])
          setWalletName(null)
        }
      }
    },
    [
      connect,
      navigate,
      networks,
      parsedParams.rChainId,
      parsedParams.rLocalePathname,
      parsedParams.restFullPathname,
      setChain,
      updateConnectState,
      setWalletName,
    ],
  )

  const handleDisconnectWallet = useCallback(
    async (wallet: Wallet) => {
      try {
        await disconnect(wallet)
        setWalletName(null)
        updateConnectState('loading', CONNECT_STAGE.CONNECT_API, [parsedParams.rChainId, false])
      } catch (error) {
        console.error(error)
      }
    },
    [disconnect, parsedParams.rChainId, updateConnectState, setWalletName],
  )

  const handleNetworkSwitch = useCallback(
    async (options: ConnectState['options']) => {
      if (options) {
        const [currChainId, newChainId] = options
        if (wallet) {
          try {
            const success = await setChain({ chainId: ethers.toQuantity(newChainId) })
            if (!success) throw new Error('reject network switch')
            updateConnectState('loading', CONNECT_STAGE.CONNECT_API, [newChainId, true])
          } catch (error) {
            console.error(error)
            updateConnectState('failure', CONNECT_STAGE.SWITCH_NETWORK)
            const foundNetwork = networks[+currChainId as ChainId]?.id
            if (foundNetwork) {
              navigate(`${parsedParams.rLocalePathname}/${foundNetwork}/${parsedParams.restFullPathname}`)
              updateConnectState('success', '')
            } else {
              updateConnectState('failure', CONNECT_STAGE.SWITCH_NETWORK)
            }
          }
        } else {
          updateConnectState('loading', CONNECT_STAGE.CONNECT_API, [newChainId, false])
        }
      }
    },
    [
      navigate,
      networks,
      parsedParams.rLocalePathname,
      parsedParams.restFullPathname,
      setChain,
      updateConnectState,
      wallet,
    ],
  )

  // onMount
  useEffect(() => {
    if (connectState.status === '' && connectState.stage === '') {
      const routerNetwork = params.network?.toLowerCase()
      const routerNetworkId = routerNetwork ? networksIdMapper[routerNetwork as INetworkName] : null
      const isActiveNetwork = routerNetworkId ? (networks[routerNetworkId]?.isActiveNetwork ?? false) : false

      if (!isActiveNetwork) {
        // network in router is not good, redirect to default network
        navigate(`${parsedParams.rLocalePathname}/ethereum${ROUTE.PAGE_SWAP}`)
      } else {
        updateGlobalStoreByKey('routerProps', { params, location, navigate })
        if (walletName) {
          updateConnectState('loading', CONNECT_STAGE.CONNECT_WALLET, [walletName])
        } else {
          updateConnectState('loading', CONNECT_STAGE.CONNECT_API, [rChainId, false])
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  useEffect(() => {
    if (connectState.status || connectState.stage) {
      if (isSuccess(connectState)) {
        updateGlobalStoreByKey('routerProps', { params, location, navigate })
      } else if (isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK)) {
        handleNetworkSwitch(getOptions(CONNECT_STAGE.SWITCH_NETWORK, connectState.options))
      } else if (isLoading(connectState, CONNECT_STAGE.CONNECT_WALLET)) {
        handleConnectWallet(getOptions(CONNECT_STAGE.CONNECT_WALLET, connectState.options))
      } else if (isLoading(connectState, CONNECT_STAGE.DISCONNECT_WALLET) && wallet) {
        handleDisconnectWallet(wallet)
      } else if (isLoading(connectState, CONNECT_STAGE.CONNECT_API)) {
        handleConnectCurveApi(getOptions(CONNECT_STAGE.CONNECT_API, connectState.options))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectState.status, connectState.stage])

  // wallet state changed not from app
  useEffect(() => {
    if (
      (isSuccess(connectState) || isFailure(connectState)) &&
      (!!walletChainId || !!walletSignerAddress || !!curve) &&
      (curve?.chainId !== walletChainId || curve?.signerAddress?.toLowerCase() !== walletSignerAddress?.toLowerCase())
    ) {
      if (walletSignerAddress && curve?.signerAddress.toLowerCase() !== walletSignerAddress?.toLowerCase()) {
        updateConnectState('loading', CONNECT_STAGE.CONNECT_API, [walletChainId, true])
      } else if (curve?.chainId !== walletChainId) {
        const { id: foundNetwork, isActiveNetwork } = networks[walletChainId as ChainId] ?? {}
        if (foundNetwork && isActiveNetwork) {
          updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [parsedParams.rChainId, walletChainId])
          navigate(`${parsedParams.rLocalePathname}/${foundNetwork}/${parsedParams.restFullPathname}`)
        } else if (walletSignerAddress) {
          updateConnectState('failure', CONNECT_STAGE.SWITCH_NETWORK)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletChainId, walletSignerAddress])

  // locale switched
  useEffect(() => {
    if (isSuccess(connectState)) {
      const rLocale = parsedParams.rLocale?.value ?? 'en'
      if (rLocale !== document.documentElement.lang) {
        ;(async () => {
          let data = await import(`@/locales/${rLocale}/messages`)
          dynamicActivate(rLocale, data)
        })()
        setLocale(rLocale)
        updateAppLocale(rLocale)
        updateWalletLocale(rLocale)
      } else if (
        walletChainId &&
        curve &&
        curve.chainId === walletChainId &&
        parsedParams.rChainId !== walletChainId &&
        location.pathname !== ROUTE.PAGE_INTEGRATIONS
      ) {
        // switch network if url network is not same as wallet
        updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [walletChainId, parsedParams.rChainId])
      } else if (curve && curve.chainId !== parsedParams.rChainId) {
        // switch network if url network is not same as api
        updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [curve.chainId, parsedParams.rChainId])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location])

  return {
    pageLoaded: connectState.status === 'success',
    routerParams: parsedParams,
    curve,
  } as PageProps
}

export default usePageOnMount

function getOptions(key: ConnectState['stage'], options: ConnectState['options']) {
  if (!options) {
    console.warn(`missing options for key ${key}`)
  }
  return options
}
