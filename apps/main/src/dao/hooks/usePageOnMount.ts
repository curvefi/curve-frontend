import { useParams, useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { CONNECT_STAGE } from '@/dao/constants'
import { helpers } from '@/dao/lib/curvejs'
import networks from '@/dao/networks'
import useStore from '@/dao/store/useStore'
import { ChainId, PageProps, type UrlParams, Wallet } from '@/dao/types/dao.types'
import { getNetworkFromUrl, getPath, parseParams } from '@/dao/utils/utilsRouter'
import type { ConnectState } from '@ui/utils'
import { isFailure, isLoading, isSuccess } from '@ui/utils'
import { getWalletChainId, getWalletSignerAddress, useSetChain, useWallet } from '@ui-kit/features/connect-wallet'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { useApiStore } from '@ui-kit/shared/useApiStore'

function usePageOnMount(chainIdNotRequired?: boolean) {
  const params = useParams() as UrlParams
  const { push } = useRouter()
  const { wallet, connect, disconnect, walletName, setWalletName } = useWallet()
  const setChain = useSetChain()
  const curve = useApiStore((state) => state.curve)
  const updateCurveJs = useApiStore((state) => state.updateCurve)
  const setIsLoadingCurve = useApiStore((state) => state.setIsLoadingCurve)
  const hydrate = useStore((s) => s.hydrate)
  const connectState = useStore((s) => s.connectState)
  const updateConnectState = useStore((state) => state.updateConnectState)

  const walletChainId = getWalletChainId(wallet)
  const walletSignerAddress = getWalletSignerAddress(wallet)
  const parsedParams = parseParams(params, chainIdNotRequired)

  const handleConnectCurveApi = useCallback(
    async (options: ConnectState['options']) => {
      if (options) {
        try {
          const [chainId, useWallet] = options
          const prevCurveApi = curve

          setIsLoadingCurve(true)

          const api = await helpers.initCurveJs(chainId, useWallet ? wallet : null)
          updateCurveJs(api)
          updateConnectState('success', '')

          hydrate(api, prevCurveApi, wallet)
        } catch (error) {
          console.error(error)
          updateConnectState('failure', CONNECT_STAGE.CONNECT_API)
        } finally {
          setIsLoadingCurve(false)
        }
      }
    },
    [curve, hydrate, setIsLoadingCurve, updateConnectState, updateCurveJs, wallet],
  )

  const handleConnectWallet = useCallback(
    async (options: ConnectState['options']) => {
      if (options) {
        const [walletName] = options
        let walletState: Wallet | null

        if (walletName) {
          // If found label in localstorage, after 30s if not connected, reconnect with modal
          const walletStatesPromise = new Promise<Wallet | null>(async (resolve, reject) => {
            try {
              const walletStates = await Promise.race([
                connect(walletName),
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
            walletState = await walletStatesPromise
          } catch (error) {
            // if failed to get walletState due to timeout, show connect modal.
            setWalletName(null)
            walletState = await connect()
          }
        } else {
          walletState = await connect()
        }

        try {
          if (!walletState) throw new Error('unable to connect')
          setWalletName(walletState.label)
          const walletChainId = getWalletChainId(walletState)
          if (walletChainId && walletChainId !== parsedParams.rChainId) {
            const success = await setChain(parsedParams.rChainId)
            if (success) {
              updateConnectState('loading', CONNECT_STAGE.CONNECT_API, [parsedParams.rChainId, true])
            } else {
              const foundNetwork = networks[walletChainId as ChainId]?.id
              if (foundNetwork) {
                console.warn(`Network switched to ${foundNetwork}, redirecting...`, parsedParams)
                push(getPath({ network: foundNetwork }, `/${parsedParams.restFullPathname}`))
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
    [connect, push, parsedParams, setChain, updateConnectState, setWalletName],
  )

  const handleDisconnectWallet = useCallback(async () => {
    try {
      await disconnect()
      setWalletName(null)
      updateConnectState('loading', CONNECT_STAGE.CONNECT_API, [parsedParams.rChainId, false])
    } catch (error) {
      console.error(error)
    }
  }, [disconnect, parsedParams.rChainId, setWalletName, updateConnectState])

  const handleNetworkSwitch = useCallback(
    async (options: ConnectState['options']) => {
      if (options) {
        const [currChainId, newChainId] = options
        if (wallet) {
          try {
            const success = await setChain(newChainId)
            if (!success) throw new Error('reject network switch')
            updateConnectState('loading', CONNECT_STAGE.CONNECT_API, [newChainId, true])
          } catch (error) {
            console.error(error)
            updateConnectState('failure', CONNECT_STAGE.SWITCH_NETWORK)
            const foundNetwork = networks[+currChainId as ChainId]?.id
            if (foundNetwork) {
              console.warn(
                `Could not switch network to ${newChainId}, redirecting to ${foundNetwork}`,
                parsedParams,
                error,
              )
              push(getPath({ network: foundNetwork }, `/${parsedParams.restFullPathname}`))
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
    [push, parsedParams, setChain, updateConnectState, wallet],
  )

  // onMount
  useEffect(() => {
    if (connectState.status === '' && connectState.stage === '') {
      if (walletName) {
        updateConnectState('loading', CONNECT_STAGE.CONNECT_WALLET, [walletName])
      } else {
        updateConnectState('loading', CONNECT_STAGE.CONNECT_API, [getNetworkFromUrl().rChainId, false])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [push])

  useEffect(() => {
    if (connectState.status || connectState.stage) {
      if (isSuccess(connectState)) {
      } else if (isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK)) {
        handleNetworkSwitch(getOptions(CONNECT_STAGE.SWITCH_NETWORK, connectState.options))
      } else if (isLoading(connectState, CONNECT_STAGE.CONNECT_WALLET)) {
        handleConnectWallet(getOptions(CONNECT_STAGE.CONNECT_WALLET, connectState.options))
      } else if (isLoading(connectState, CONNECT_STAGE.DISCONNECT_WALLET) && wallet) {
        handleDisconnectWallet()
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
      !!curve &&
      !!walletChainId &&
      (curve.chainId !== walletChainId || curve.signerAddress?.toLowerCase() !== walletSignerAddress?.toLowerCase())
    ) {
      if (curve.signerAddress.toLowerCase() !== walletSignerAddress?.toLowerCase()) {
        updateConnectState('loading', CONNECT_STAGE.CONNECT_API, [walletChainId, true])
      } else if (curve?.chainId !== walletChainId) {
        const foundNetwork = networks[walletChainId as ChainId]?.id
        if (foundNetwork) {
          updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [parsedParams.rChainId, walletChainId])
          console.warn(`Network switched to ${foundNetwork}, redirecting...`, parsedParams)
          push(getPath({ network: foundNetwork }, `/${parsedParams.restFullPathname}`))
        } else {
          updateConnectState('failure', CONNECT_STAGE.SWITCH_NETWORK)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletChainId, walletSignerAddress])

  // locale switched
  useEffect(() => {
    if (isSuccess(connectState)) {
      if (walletChainId && curve && curve.chainId === walletChainId && parsedParams.rChainId !== walletChainId) {
        // switch network if url network is not same as wallet
        updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [walletChainId, parsedParams.rChainId])
      } else if (curve && curve.chainId !== parsedParams.rChainId) {
        // switch network if url network is not same as api
        updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [curve.chainId, parsedParams.rChainId])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
