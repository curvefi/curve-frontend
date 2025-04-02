import { ethers } from 'ethers'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { CONNECT_STAGE, ROUTE } from '@/loan/constants'
import networks, { networksIdMapper } from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import { ChainId, type NetworkEnum, PageProps, type UrlParams, Wallet } from '@/loan/types/loan.types'
import { initLendApi, initStableJs } from '@/loan/utils/utilsCurvejs'
import { getPath, parseNetworkFromUrl, parseParams } from '@/loan/utils/utilsRouter'
import type { INetworkName } from '@curvefi/stablecoin-api/lib/interfaces'
import type { ConnectState } from '@ui/utils'
import { isFailure, isLoading, isSuccess } from '@ui/utils'
import { getWalletChainId, getWalletSignerAddress, useSetChain, useWallet } from '@ui-kit/features/connect-wallet'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { useApiStore } from '@ui-kit/shared/useApiStore'

function usePageOnMount(chainIdNotRequired?: boolean) {
  const params = useParams() as UrlParams
  const { push } = useRouter()
  const { wallet, connect, disconnect, walletName, setWalletName } = useWallet()
  const [_, setChain] = useSetChain()

  const curve = useApiStore((state) => state.stable)
  const lending = useApiStore((state) => state.lending)
  const updateStable = useApiStore((state) => state.updateStable)
  const updateLending = useApiStore((state) => state.updateLending)
  const setIsLoadingStable = useApiStore((state) => state.setIsLoadingStable)
  const setIsLoadingLending = useApiStore((state) => state.setIsLoadingLending)
  const hydrate = useStore((s) => s.hydrate)

  const connectState = useStore((state) => state.connectState)
  const updateConnectState = useStore((state) => state.updateConnectState)
  const initCampaignRewards = useStore((state) => state.campaigns.initCampaignRewards)
  const initiated = useStore((state) => state.campaigns.initiated)

  const walletChainId = getWalletChainId(wallet)
  const walletSignerAddress = getWalletSignerAddress(wallet)
  const parsedParams = parseParams(params, chainIdNotRequired)
  const pathname = usePathname()

  const handleConnectCurveApi = useCallback(
    async (options: ConnectState['options']) => {
      if (options) {
        try {
          const [chainId, useWallet] = options
          const prevApi = curve ?? null

          setIsLoadingStable(true)

          if (useWallet && wallet) {
            const api = await initStableJs(chainId, wallet)
            updateConnectState('success', '')
            await hydrate(api, prevApi, wallet)
            updateStable(api)
          } else {
            updateConnectState('', '')
          }
        } catch (error) {
          console.error(error)
          updateConnectState('failure', CONNECT_STAGE.CONNECT_API)
        } finally {
          setIsLoadingStable(false)
        }
      }
    },
    [curve, setIsLoadingStable, wallet, updateStable, updateConnectState, hydrate],
  )

  const handleConnectLendApi = useCallback(
    async (options: ConnectState['options']) => {
      if (options) {
        try {
          const [chainId, useWallet] = options
          const prevApi = lending ?? null

          setIsLoadingLending(true)

          const api = await initLendApi(chainId, useWallet ? wallet : null)
          if (api) {
            updateLending(api)
            updateConnectState('success', '')

            await hydrate(api, prevApi, wallet)
          } else {
            updateConnectState('', '')
          }
        } catch (error) {
          console.error(error)
          updateConnectState('failure', CONNECT_STAGE.CONNECT_API)
        } finally {
          setIsLoadingLending(false)
        }
      }
    },
    [lending, setIsLoadingLending, wallet, updateLending, updateConnectState, hydrate],
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
              const { id: foundNetwork, isActiveNetwork } = networks[walletChainId as ChainId] ?? {}
              if (foundNetwork && isActiveNetwork) {
                console.warn(`Network switched to ${foundNetwork}, redirecting...`, parsedParams)
                push(getPath({ network: foundNetwork as NetworkEnum }, `/${parsedParams.restFullPathname}`))
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
              console.warn(
                `Could not switch network to ${newChainId}, redirecting to ${foundNetwork}`,
                parsedParams,
                error,
              )
              push(getPath({ network: foundNetwork as NetworkEnum }, `/${parsedParams.restFullPathname}`))
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
      const routerNetwork = params.network?.toLowerCase()
      const routerNetworkId = routerNetwork ? networksIdMapper[routerNetwork as INetworkName] : null
      const isActiveNetwork = routerNetworkId ? (networks[routerNetworkId]?.isActiveNetwork ?? false) : false

      if (!isActiveNetwork) {
        console.warn(`Network ${routerNetwork} is not active, redirecting to default network`)
        push(getPath({ network: 'ethereum' }, ROUTE.PAGE_MARKETS))
      } else {
        if (walletName) {
          updateConnectState('loading', CONNECT_STAGE.CONNECT_WALLET, [walletName])
        } else {
          updateConnectState('loading', CONNECT_STAGE.CONNECT_API, [parseNetworkFromUrl(params).rChainId, false])
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [push])

  useEffect(() => {
    if (connectState.status || connectState.stage) {
      if (isSuccess(connectState)) {
      } else if (isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK)) {
        void handleNetworkSwitch(getOptions(CONNECT_STAGE.SWITCH_NETWORK, connectState.options))
      } else if (isLoading(connectState, CONNECT_STAGE.CONNECT_WALLET)) {
        void handleConnectWallet(getOptions(CONNECT_STAGE.CONNECT_WALLET, connectState.options))
      } else if (isLoading(connectState, CONNECT_STAGE.DISCONNECT_WALLET) && wallet) {
        void handleDisconnectWallet(wallet)
      } else if (isLoading(connectState, CONNECT_STAGE.CONNECT_API)) {
        void handleConnectCurveApi(getOptions(CONNECT_STAGE.CONNECT_API, connectState.options))
        void handleConnectLendApi(getOptions(CONNECT_STAGE.CONNECT_API, connectState.options))
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
        const foundNetwork = networks[walletChainId as ChainId]?.id
        if (foundNetwork) {
          updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [parsedParams.rChainId, walletChainId])
          console.warn(`Network switched to ${foundNetwork}, redirecting...`, parsedParams)
          push(getPath({ network: foundNetwork as NetworkEnum }, `/${parsedParams.restFullPathname}`))
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
      if (
        walletChainId &&
        curve &&
        curve.chainId === walletChainId &&
        parsedParams.rChainId !== walletChainId &&
        pathname !== ROUTE.PAGE_INTEGRATIONS
      ) {
        // switch network if url network is not same as wallet
        updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [walletChainId, parsedParams.rChainId])
      } else if (curve && curve.chainId !== parsedParams.rChainId) {
        // switch network if url network is not same as api
        updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [curve.chainId, parsedParams.rChainId])
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  // init campaignRewardsMapper
  useEffect(() => {
    if (!curve) return

    if (!initiated) {
      initCampaignRewards(curve.chainId)
    }
  }, [initCampaignRewards, curve, initiated])

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
