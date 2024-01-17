import { ethers } from 'ethers'
import { useConnectWallet, useSetChain } from 'onboard-helpers'
import { useNavigate } from 'react-router-dom'
import cloneDeep from 'lodash/cloneDeep'
import React, { useCallback, useEffect } from 'react'

import { ROUTE } from '@/constants'
import { getPath } from '@/utils/utilsRouter'
import { getWalletChainId } from '@/store/createWalletSlice'
import { getStorageValue, log } from '@/utils'
import networks from '@/networks'
import useStore from '@/store/useStore'

/*
Connect network logic
1. New connection:
   Clicking 'Connect Wallet' button should update Wallet's network to match App's network.

2. Already connected:
   Pool's page: switching wallet network should update App's network and redirect to pool list.
   All other pages, switching wallet network should update App's network.

3. Navigating to app with a pathname that contains pool id:
   Wallet network should switch to App's network.
 */
const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
  const [{ wallet }, connect, disconnect] = useConnectWallet()
  const [_, setChain] = useSetChain()
  const navigate = useNavigate()

  const curve = useStore((state) => state.curve)
  const appNetworkId = useStore((state) => state.appNetworkId)
  const isConnectWallet = useStore((state) => state.wallet.isConnectWallet)
  const isDisconnectWallet = useStore((state) => state.wallet.isDisconnectWallet)
  const isNetworkChangedFromApp = useStore((state) => state.wallet.isNetworkChangedFromApp)
  const isSwitchNetwork = useStore((state) => state.wallet.isSwitchNetwork)
  const loaded = useStore((state) => state.wallet.loaded)
  const onboard = useStore((state) => state.wallet.onboard)
  const routerProps = useStore((state) => state.routerProps)
  const routerAppNetworkId = useStore((state) => state.routerAppNetworkId)
  const setAppNetworkId = useStore((state) => state.setAppNetworkId)
  const updateCurveJs = useStore((state) => state.updateCurveJs)
  const updateGlobalStoreByKey = useStore((state) => state.updateGlobalStoreByKey)
  const updateWallet = useStore((state) => state.wallet.updateWallet)
  const updateWalletStoreByKey = useStore((state) => state.wallet.updateWalletStoreByKey)

  const walletAccount = wallet?.accounts?.[0].address ?? ''
  const walletChainId = wallet ? getWalletChainId(wallet) : 0
  const walletPrimary = walletAccount ? `${walletAccount.toLowerCase()}-${walletChainId}` : ''
  const curveWalletPrimary = curve ? `${curve.signerAddress.toLowerCase()}-${curve.chainId}` : ''

  const handleError = useCallback(
    (routerAppNetworkId: ChainId, error: unknown) => {
      log('handleError', routerAppNetworkId, error)
      updateCurveJs(routerAppNetworkId, null)
    },
    [updateCurveJs]
  )

  const connectWithoutProvider = useCallback(
    async (routerAppNetworkId: ChainId) => {
      try {
        log('connectWithoutProvider', routerAppNetworkId)
        await updateWallet(routerAppNetworkId, null)
        await updateCurveJs(routerAppNetworkId, null)
      } catch (error) {
        handleError(routerAppNetworkId, error)
      }
    },
    [handleError, updateCurveJs, updateWallet]
  )

  const connectWithProvider = useCallback(
    async (routerAppNetworkId: ChainId, wallet: Wallet) => {
      log('connectWithProvider', routerAppNetworkId, wallet.label)
      try {
        const cWallet = cloneDeep(wallet)
        await updateWallet(routerAppNetworkId, cWallet)
        await updateCurveJs(routerAppNetworkId, cWallet)
      } catch (error) {
        handleError(routerAppNetworkId, error)
      }
    },
    [handleError, updateCurveJs, updateWallet]
  )

  const redirect = useCallback(
    (walletNetworkName: string) => {
      const { location, params } = routerProps ?? {}
      const { network } = params ?? {}

      if (location && network) {
        const pathnameArr = location?.pathname.split('/')
        const foundOldNetworkIdx = pathnameArr.findIndex((t) => t === network)

        if (foundOldNetworkIdx !== -1) {
          pathnameArr.splice(foundOldNetworkIdx, 1, walletNetworkName)
          navigate(pathnameArr.join('/'))
        }
      }
    },
    [navigate, routerProps]
  )

  const handleDisconnectWallet = useCallback(
    async (routerAppNetworkId: ChainId) => {
      log('handleDisconnectWallet', wallet?.label, routerAppNetworkId)

      if (wallet) await disconnect(wallet)
      updateWalletStoreByKey('isDisconnectWallet', false)
      await connectWithoutProvider(routerAppNetworkId)
    },
    [connectWithoutProvider, disconnect, updateWalletStoreByKey, wallet]
  )

  const initEvmWallet = useCallback(
    async (routerAppNetworkId: ChainId, cachedWalletName: string | null) => {
      log('initEvmWallet', routerAppNetworkId, cachedWalletName, { onboard })
      if (cachedWalletName && isValidCachedWalletName(cachedWalletName)) {
        if (wallet) await disconnect(wallet)
        await connect('ethereum' in window ? { autoSelect: { label: cachedWalletName, disableModals: false } } : {})
        updateWalletStoreByKey('loaded', true)
      } else {
        updateWalletStoreByKey('loaded', true)
      }
    },
    [connect, disconnect, onboard, updateWalletStoreByKey, wallet]
  )

  const handleSwitchNetworkDisconnect = useCallback(
    (appNetworkId: ChainId) => {
      const networkName = networks[appNetworkId].id
      redirect(networkName)
      handleDisconnectWallet(appNetworkId)
    },
    [handleDisconnectWallet, redirect]
  )

  const handleSwitchNetwork = useCallback(
    async (routerAppNetworkId: number) => {
      log('handleSwitchNetwork', routerAppNetworkId)

      if (wallet) {
        const hexChainId = ethers.toQuantity(routerAppNetworkId)
        const chainUpdated = await setChain({ chainId: hexChainId })

        // user rejects network switch
        if (!chainUpdated) {
          if (routerProps?.params.pool) {
            // if user rejects and is on a specific pool page, disconnect user wallet.
            await handleDisconnectWallet(appNetworkId)
          } else if (wallet) {
            // if connected wallet, connect app network to wallet network
            const walletNetworkId = getWalletChainId(wallet) as ChainId
            const walletNetwork = networks[walletNetworkId as ChainId]?.id

            if (walletNetworkId && walletNetwork) {
              redirect(walletNetwork)
              await connectWithProvider(walletNetworkId, wallet)
            } else {
              handleSwitchNetworkDisconnect(appNetworkId)
            }
          } else {
            handleSwitchNetworkDisconnect(appNetworkId)
          }
        }
      }
    },
    [
      appNetworkId,
      connectWithProvider,
      handleDisconnectWallet,
      handleSwitchNetworkDisconnect,
      redirect,
      routerProps?.params.pool,
      setChain,
      wallet,
    ]
  )

  const handleConnectWallet = useCallback(
    async (routerAppNetworkId: ChainId | '') => {
      log('handleConnectWallet', routerAppNetworkId, isNetworkChangedFromApp)

      const connected = await connect()

      if (!connected[0]) {
        updateGlobalStoreByKey('isLoadingApi', false)
      }
      updateWalletStoreByKey('isConnectWallet', false)
      updateWalletStoreByKey('isNetworkChangedFromApp', false)
    },
    [connect, isNetworkChangedFromApp, updateGlobalStoreByKey, updateWalletStoreByKey]
  )

  const updateWalletFn = useCallback(
    async (cb: () => void) => {
      if (typeof cb === 'function') {
        updateGlobalStoreByKey('isLoadingApi', true)
        cb()
      }
    },
    [updateGlobalStoreByKey]
  )

  // onMount
  useEffect(() => {
    if (routerAppNetworkId) {
      setAppNetworkId(routerAppNetworkId)
      const { walletName = '' } = getStorageValue('APP_CACHE') ?? {}

      ;(async () => {
        if (!appNetworkId) {
          updateWalletFn(() => initEvmWallet(routerAppNetworkId, walletName))
        } else if (routerAppNetworkId !== appNetworkId) {
          updateWalletFn(() => handleSwitchNetwork(routerAppNetworkId))
        } else if (isConnectWallet) {
          updateWalletFn(() => handleConnectWallet(routerAppNetworkId))
        } else if (isDisconnectWallet) {
          updateWalletFn(() => handleDisconnectWallet(routerAppNetworkId))
        } else if (appNetworkId !== routerAppNetworkId || isSwitchNetwork) {
          updateWalletFn(() => handleSwitchNetwork(routerAppNetworkId))
        }
      })()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routerAppNetworkId, isConnectWallet, isDisconnectWallet, isSwitchNetwork])

  const updateNetwork = useCallback(
    async (walletPrimary: string, curveWalletPrimary: string, routerAppNetworkId: ChainId) => {
      updateWalletStoreByKey('isNetworkMismatched', false)
      const walletNetworkName = networks[walletChainId as ChainId]?.id

      if (walletPrimary) {
        if (walletPrimary !== curveWalletPrimary && routerAppNetworkId !== walletChainId && walletNetworkName) {
          if (isNetworkChangedFromApp || !curve) {
            // update wallet network if network switch from app or app does not have curve-js initialized.
            await handleSwitchNetwork(routerAppNetworkId)
          } else if (routerProps?.params.pool && curve) {
            // redirect to pool list if switch network from wallet
            navigate(getPath({ ...routerProps.params, network: walletNetworkName }, ROUTE.PAGE_POOLS))
          } else {
            redirect(walletNetworkName)
          }
        } else if (walletPrimary !== curveWalletPrimary && walletChainId === routerAppNetworkId && wallet) {
          await connectWithProvider(routerAppNetworkId, wallet)
        } else if (!walletNetworkName && curve?.chainId === routerAppNetworkId) {
          updateWalletStoreByKey('isNetworkMismatched', true)
        } else if (!walletNetworkName && !curve && walletChainId !== routerAppNetworkId) {
          updateWalletStoreByKey('isSwitchNetwork', true)
        }
      } else {
        if (curve?.chainId !== routerAppNetworkId) {
          await connectWithoutProvider(routerAppNetworkId)
        }
      }
    },
    [
      connectWithProvider,
      connectWithoutProvider,
      curve,
      handleSwitchNetwork,
      isNetworkChangedFromApp,
      navigate,
      redirect,
      routerProps?.params,
      updateWalletStoreByKey,
      wallet,
      walletChainId,
    ]
  )

  useEffect(() => {
    if (loaded && routerAppNetworkId) {
      updateNetwork(walletPrimary, curveWalletPrimary, routerAppNetworkId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, walletPrimary, curveWalletPrimary, routerAppNetworkId])

  return <>{children}</>
}

export default NetworkProvider

export function isValidCachedWalletName(cachedWalletName: string | null) {
  const ethereumInjectionExists = window.hasOwnProperty('ethereum')
  if (cachedWalletName === 'Trust Wallet') {
    return ethereumInjectionExists && (window['ethereum'].isTrust || window['ethereum'].isTrustWallet)
  } else if (cachedWalletName === 'BitKeep' || cachedWalletName === 'Bitget') {
    return ethereumInjectionExists && window['ethereum'].isBitKeep
  } else if (cachedWalletName === 'Enkrypt') {
    return ethereumInjectionExists && window['ethereum'].isEnkrypt
  } else {
    return true
  }
}
