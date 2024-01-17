import { cloneDeep } from 'lodash'
import { ethers } from 'ethers'
import { useConnectWallet, useSetChain } from 'onboard-helpers'
import { useNavigate } from 'react-router-dom'
import React, { useCallback, useEffect } from 'react'

import { getWalletChainId } from '@/store/createWalletSlice'
import { log } from '@/utils/helpers'
import { getStorageValue } from '@/utils/storage'
import networks from '@/networks'
import useStore from '@/store/useStore'

const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
  const [{ wallet }, connect, disconnect] = useConnectWallet()
  const [{}, setChain] = useSetChain()
  const navigate = useNavigate()

  const curve = useStore((state) => state.curve)
  const appNetworkId = useStore((state) => state.appNetworkId)
  const isConnectWallet = useStore((state) => state.wallet.isConnectWallet)
  const isDisconnectWallet = useStore((state) => state.wallet.isDisconnectWallet)
  const isSwitchNetwork = useStore((state) => state.wallet.isSwitchNetwork)
  const loaded = useStore((state) => state.wallet.loaded)
  const onboard = useStore((state) => state.wallet.onboard)
  const routerProps = useStore((state) => state.routerProps)
  const routerAppNetworkId = useStore((state) => state.routerAppNetworkId)
  const showProviderDialogDiscarded = useStore((state) => state.wallet.showProviderDialogDiscarded)
  const signer = useStore((state) => state.wallet.signer)
  const updateCurveJs = useStore((state) => state.updateCurveJs)
  const setAppCache = useStore((state) => state.setAppCache)
  const setWallet = useStore((state) => state.wallet.setWallet)
  const setWalletStateByKey = useStore((state) => state.wallet.setStateByKey)
  const updateGlobalStoreByKey = useStore((state) => state.updateGlobalStoreByKey)

  const walletAccount = wallet?.accounts?.[0].address ?? ''
  const walletChainId = wallet ? getWalletChainId(wallet) : 0
  const walletPrimary = walletAccount ? `${walletAccount.toLowerCase()}-${walletChainId}` : ''
  const curveWalletPrimary = curve ? `${(curve.signerAddress ?? '').toLowerCase()}-${curve.chainId}` : ''

  const handleError = useCallback(
    (routerAppNetworkId: ChainId, error: Error) => {
      log('handleError', routerAppNetworkId, error)
      updateCurveJs(routerAppNetworkId, null)
    },
    [updateCurveJs]
  )

  const connectWithoutProvider = useCallback(
    async (routerAppNetworkId: ChainId) => {
      try {
        log('connectWithoutProvider', routerAppNetworkId)
        await setWallet(routerAppNetworkId, null)
        await updateCurveJs(routerAppNetworkId, null)
      } catch (error) {
        handleError(routerAppNetworkId, error)
      }
    },
    [handleError, updateCurveJs, setWallet]
  )

  const connectWithProvider = useCallback(
    async (routerAppNetworkId: ChainId, wallet: Wallet) => {
      log('connectWithProvider', routerAppNetworkId, wallet.label)
      try {
        const cWallet = cloneDeep(wallet)
        await setWallet(routerAppNetworkId, cWallet)
        await updateCurveJs(routerAppNetworkId, cWallet)
        return cWallet
      } catch (error) {
        handleError(routerAppNetworkId, error)
      }
    },
    [handleError, updateCurveJs, setWallet]
  )

  const redirect = useCallback(
    (walletNetworkName: string) => {
      if (routerProps) {
        const updatedPathname = routerProps?.location?.pathname.split('/')
        const { location, params } = routerProps

        if (location && params) {
          const { network } = params
          const foundOldNetworkIdx = location.pathname.split('/').findIndex((t) => t === network)

          if (foundOldNetworkIdx !== -1) {
            updatedPathname.splice(foundOldNetworkIdx, 1, walletNetworkName)
            navigate(updatedPathname.join('/'))
          }
        }
      }
    },
    [navigate, routerProps]
  )

  const handleDisconnectWallet = useCallback(
    async (routerAppNetworkId: ChainId) => {
      log('handleDisconnectWallet', routerAppNetworkId)
      if (wallet) {
        disconnect(wallet)
      }

      setWalletStateByKey('isDisconnectWallet', false)
      connectWithoutProvider(routerAppNetworkId)
    },
    [wallet, setWalletStateByKey, connectWithoutProvider, disconnect]
  )

  const handleDiscardedDialog = useCallback(
    async (routerAppNetworkId: ChainId) => {
      if (!signer) {
        connectWithoutProvider(routerAppNetworkId)
      }
    },
    [connectWithoutProvider, signer]
  )

  const initEvmWallet = useCallback(
    async (routerAppNetworkId: ChainId, cachedWalletName: string | null) => {
      log('initEvmWallet', routerAppNetworkId, cachedWalletName, { onboard })
      if (cachedWalletName && isValidCachedWalletName(cachedWalletName)) {
        if (wallet) await disconnect(wallet)
        await connect('ethereum' in window ? { autoSelect: { label: cachedWalletName, disableModals: false } } : {})
        setWalletStateByKey('loaded', true)
      } else {
        setWalletStateByKey('loaded', true)
      }
    },
    [connect, disconnect, onboard, setWalletStateByKey, wallet]
  )

  const handleSwitchNetwork = useCallback(
    async (routerAppNetworkId: number) => {
      log('handleSwitchNetwork', routerAppNetworkId)

      if (wallet) {
        const hexChainId = ethers.utils.hexValue(routerAppNetworkId)
        const chainUpdated = await setChain({ chainId: hexChainId })

        // switch route back to origin route
        if (!chainUpdated && appNetworkId) {
          const networkName = networks[appNetworkId].id
          redirect(networkName)
          connectWithProvider(appNetworkId, wallet)
        }
      }
    },
    [appNetworkId, connectWithProvider, redirect, setChain, wallet]
  )

  const handleConnectWallet = useCallback(
    async (routerAppNetworkId: ChainId) => {
      log('handleConnectWallet', routerAppNetworkId)
      connect()
      setWalletStateByKey('isConnectWallet', false)
      setWalletStateByKey('isNetworkChangedFromApp', false)
    },
    [connect, setWalletStateByKey]
  )

  // onMount
  useEffect(() => {
    if (routerAppNetworkId) {
      updateGlobalStoreByKey('loading', true)
      setAppCache('appNetworkId', routerAppNetworkId)
      const { walletName = '' } = getStorageValue('APP_CACHE') ?? {}

      if (!appNetworkId) {
        initEvmWallet(routerAppNetworkId, walletName)
      } else if (routerAppNetworkId !== appNetworkId) {
        handleSwitchNetwork(routerAppNetworkId)
      } else if (isConnectWallet) {
        handleConnectWallet(routerAppNetworkId)
      } else if (isDisconnectWallet) {
        handleDisconnectWallet(routerAppNetworkId)
      } else if (showProviderDialogDiscarded) {
        handleDiscardedDialog(routerAppNetworkId)
      } else if (appNetworkId !== routerAppNetworkId || isSwitchNetwork) {
        handleSwitchNetwork(routerAppNetworkId)
      }
      updateGlobalStoreByKey('loading', false)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routerAppNetworkId, isConnectWallet, isDisconnectWallet, isSwitchNetwork, showProviderDialogDiscarded])

  const updateNetwork = useCallback(
    async (walletPrimary: string, curveWalletPrimary: string, routerAppNetworkId: ChainId) => {
      setWalletStateByKey('isNetworkMismatched', false)
      const walletNetworkName = walletChainId ? networks[walletChainId as ChainId]?.id : ''

      if (walletPrimary) {
        if (walletPrimary !== curveWalletPrimary && routerAppNetworkId !== walletChainId && walletNetworkName) {
          redirect(walletNetworkName)
        } else if (wallet && walletPrimary !== curveWalletPrimary && walletChainId === routerAppNetworkId) {
          connectWithProvider(routerAppNetworkId, wallet)
        } else if (!walletNetworkName && curve?.chainId === routerAppNetworkId) {
          setWalletStateByKey('isNetworkMismatched', true)
        } else if (!walletNetworkName && !curve && walletChainId !== routerAppNetworkId) {
          setWalletStateByKey('isSwitchNetwork', true)
        }
      } else {
        if (curve?.chainId !== routerAppNetworkId) {
          connectWithoutProvider(routerAppNetworkId)
        }
      }
    },
    [connectWithProvider, connectWithoutProvider, curve, redirect, setWalletStateByKey, wallet, walletChainId]
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
  if (cachedWalletName === 'Trust Wallet') {
    return !!window?.ethereum?.isTrust || !!window?.ethereum?.isTrustWallet
  } else {
    return true
  }
}
