import type { WalletState } from '@web3-onboard/core'

import { useCallback, useEffect, useRef } from 'react'
import { useConnectWallet, useSetChain, useSetLocale } from '@web3-onboard/react'
import { ethers } from 'ethers'

import { getWallet } from '../utils/helpers'
import { CONNECT_STAGE, ConnectOptions, ConnectState, isSuccess } from '../utils/connectStatus'
import { useLocation, useNavigate } from 'react-router-dom'

const useOnboardHelpers = (
  defaultPathname: string,
  defaultChainId: number,
  api: { chainId: number | null; signerAddress: string } | null,
  route: { rChainId: number; rLocale: { value: string } | null; rLocalePathname: string; restFullPathname: string },
  routeNetworkId: number | null | undefined,
  isIntegrationPage: boolean,
  connectState: ConnectState,
  getNetwork: (chainId: number) => { networkId: string | null; isActiveNetwork: boolean },
  updateApi: (chainId: number, wallet: WalletState | null) => Promise<void>,
  updateConnectState: <S extends CONNECT_STAGE>(
    status: ConnectState['status'],
    stage: S | '',
    options?: ConnectOptions[S]
  ) => void,
  updateLocale: (locale: string) => void,
  updateRouterProps: () => void
) => {
  const [{ wallet }, connect, disconnect] = useConnectWallet()
  const [_, setChain] = useSetChain()
  const updateWalletLocale = useSetLocale()
  const navigate = useNavigate()
  const location = useLocation()
  const walletRef = useRef(wallet)

  const { chainId: apiChainId, signerAddress: apiSignerAddress } = api || { chainId: null, signerAddress: '' }
  const { rChainId: routeChainId, rLocalePathname: routeLocalePathname, restFullPathname: routeFullPathname } = route
  const routeLocale = route.rLocale?.value ?? 'en'
  const locationPathname = location.pathname
  const { walletChainId, walletSignerAddress } = getWallet(wallet)

  const isSameChainId = {
    apiRoute: apiChainId === routeChainId && !isIntegrationPage,
    apiWallet: !!walletChainId && +walletChainId === apiChainId,
    routeWallet: !!walletChainId && +walletChainId === routeChainId,
    apiWalletRoute:
      !!walletChainId && +walletChainId === apiChainId && +walletChainId === routeChainId && !isIntegrationPage,
  }

  const isSameAddress = {
    apiWallet: apiSignerAddress.toLowerCase() === walletSignerAddress,
  }

  const isSameLocale = routeLocale === document.documentElement.lang

  const updateConnectSwitchNetwork = useCallback(
    (options: ConnectOptions[CONNECT_STAGE.SWITCH_NETWORK]) => {
      updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, options)
    },
    [updateConnectState]
  )

  const updateConnectApi = useCallback(
    (options: ConnectOptions[CONNECT_STAGE.CONNECT_API]) => {
      updateConnectState('loading', CONNECT_STAGE.CONNECT_API, options)
    },
    [updateConnectState]
  )

  const handleReconnectWallet = useCallback(
    async (walletState: WalletState, chainId?: number) => {
      const label = walletState.label
      await disconnect(walletState)
      const newWalletState = (await connect({ autoSelect: { label, disableModals: true } }))[0]
      if (chainId) {
        await setChain({ chainId: ethers.toQuantity(chainId) })
        await _isNetworkSwitched(chainId)
      }
      return newWalletState
    },
    [connect, disconnect, setChain]
  )

  const handleConnectCurveApi = useCallback(
    async ([chainId, useWallet]: ConnectOptions[CONNECT_STAGE.CONNECT_API]) => {
      try {
        let parsedWallet = useWallet ? wallet : null
        const { walletChainId } = getWallet(parsedWallet)

        // check wallet sync again
        if (parsedWallet && walletChainId && +walletChainId !== chainId) {
          parsedWallet = await handleReconnectWallet(parsedWallet, chainId)
        }

        await updateApi(chainId, useWallet ? parsedWallet : null)
        updateConnectState('success', '')
      } catch (error) {
        console.error(error)
        updateConnectState('failure', CONNECT_STAGE.CONNECT_API)
      }
    },
    [wallet, updateApi, updateConnectState, handleReconnectWallet]
  )

  const handleConnectWallet = useCallback(
    async (walletName: ConnectOptions[CONNECT_STAGE.CONNECT_WALLET]) => {
      let walletState

      if (!walletName) {
        walletState = (await connect())?.[0]
      } else {
        // If found label in localstorage, after 30s if not connected, reconnect with modal
        const walletStatesPromise = new Promise<WalletState[] | null>(async (resolve, reject) => {
          try {
            const walletStates = await Promise.race([
              connect({ autoSelect: { label: walletName, disableModals: true } }),
              new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout connect wallet')), 3000)),
            ])
            resolve(walletStates)
          } catch (error) {
            reject(error)
          }
        })

        try {
          const walletStates = await walletStatesPromise
          if (!walletStates || walletStates?.length === 0) throw new Error('unable to connect')
          walletState = walletStates[0]
        } catch (error) {
          // if failed to get walletState due to timeout, show connect modal.
          ;[walletState] = await connect()
        }
      }

      try {
        if (!walletState) throw new Error('No wallet found')

        const { walletChainId, walletChainIdHex } = getWallet(walletState)

        if (walletChainId && walletChainIdHex) {
          let parsedChainId = +walletChainId

          // if route and wallet chainId does not match, update wallet's chainId
          if (+walletChainId !== routeChainId) {
            const success = await setChain({ chainId: ethers.toQuantity(routeChainId) })
            if (!success) throw new Error('reject network switch')
            parsedChainId = routeChainId
          }

          // confirm wallet's chainId is updated
          const { isNetworkSwitched } = await _isNetworkSwitched(routeChainId)

          if (!isNetworkSwitched) {
            const { networkId, isActiveNetwork } = getNetwork(parsedChainId)

            if (networkId && isActiveNetwork) {
              navigate(`${routeLocalePathname}/${networkId}/${routeFullPathname}`)
              updateConnectApi([parsedChainId, true])
            } else {
              updateConnectState('failure', CONNECT_STAGE.SWITCH_NETWORK)
            }
            return
          }
          updateConnectApi([parsedChainId, true])
        }
      } catch (error) {
        console.error(error)
        updateConnectApi([routeChainId, false])
      }
    },
    [
      connect,
      getNetwork,
      navigate,
      routeChainId,
      routeFullPathname,
      routeLocalePathname,
      setChain,
      updateConnectApi,
      updateConnectState,
    ]
  )

  const handleDisconnectWallet = useCallback(
    async (wallet: WalletState) => {
      try {
        await disconnect(wallet)
        updateConnectApi([routeChainId, false])
      } catch (error) {
        console.error(error)
      }
    },
    [disconnect, routeChainId, updateConnectApi]
  )

  const handleNetworkSwitch = useCallback(
    async ([currChainId, newChainId]: ConnectOptions[CONNECT_STAGE.SWITCH_NETWORK]) => {
      if (wallet) {
        try {
          await setChain({ chainId: ethers.toQuantity(newChainId) })
          const { isNetworkSwitched, isWalletInSync } = await _isNetworkSwitched(+newChainId)

          if (!isWalletInSync) await handleReconnectWallet(wallet)
          if (!isNetworkSwitched) throw new Error('reject network switch')

          updateConnectApi([newChainId, true])
        } catch (error) {
          console.error(error)
          updateConnectState('failure', CONNECT_STAGE.SWITCH_NETWORK)
          const { networkId, isActiveNetwork } = getNetwork(currChainId)
          if (networkId && isActiveNetwork) {
            navigate(`${routeLocalePathname}/${networkId}/${routeFullPathname}`)
            updateConnectState('success', '')
          } else {
            updateConnectState('failure', CONNECT_STAGE.SWITCH_NETWORK)
          }
        }
      } else {
        updateConnectApi([newChainId, false])
      }
    },
    [
      getNetwork,
      handleReconnectWallet,
      navigate,
      routeFullPathname,
      routeLocalePathname,
      setChain,
      updateConnectApi,
      updateConnectState,
      wallet,
    ]
  )

  const init = useCallback(
    (isActiveNetwork: boolean) => {
      const wallet = walletRef.current
      const parsedChainId = isActiveNetwork ? routeChainId : defaultChainId

      const { walletChainId } = getWallet(wallet)

      if (walletChainId && (+walletChainId !== +routeChainId || !isActiveNetwork)) {
        return updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [+walletChainId, parsedChainId])
      }

      updateConnectState('loading', CONNECT_STAGE.CONNECT_API, [parsedChainId, !!wallet])
    },
    [defaultChainId, routeChainId, updateConnectState]
  )

  useEffect(() => {
    if (walletRef) walletRef.current = wallet
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletChainId, walletSignerAddress])

  // onMount
  useEffect(() => {
    if (connectState.status === '' && connectState.stage === '') {
      const isActiveNetwork = routeNetworkId ? getNetwork(routeNetworkId).isActiveNetwork : false

      // if network in route is not good, navigate to app default network
      if (!isActiveNetwork) navigate(defaultPathname)

      // wait to see if Blocknative connect wallet first before initialing.
      setTimeout(() => init(isActiveNetwork), 3000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (connectState.status || connectState.stage) {
      const { status, stage, options } = connectState

      if (isSuccess(connectState)) {
        updateRouterProps()
      } else if (status === 'loading') {
        if (stage === CONNECT_STAGE.SWITCH_NETWORK) {
          handleNetworkSwitch(options as ConnectOptions[CONNECT_STAGE.SWITCH_NETWORK])
        } else if (stage === CONNECT_STAGE.CONNECT_WALLET) {
          handleConnectWallet(options as ConnectOptions[CONNECT_STAGE.CONNECT_WALLET])
        } else if (stage === CONNECT_STAGE.DISCONNECT_WALLET) {
          !!wallet && handleDisconnectWallet(wallet)
        } else if (stage === CONNECT_STAGE.CONNECT_API) {
          handleConnectCurveApi(options as ConnectOptions[CONNECT_STAGE.CONNECT_API])
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectState.status, connectState.stage])

  // wallet state changed not from app
  useEffect(() => {
    if (connectState.status === '' || connectState.status === 'loading') return
    if (isSameAddress.apiWallet && isSameChainId.apiWalletRoute) return

    if (!isSameAddress.apiWallet && !!walletChainId) {
      updateConnectApi([+walletChainId, true])
    } else if (!isSameChainId.apiWalletRoute && !!walletChainId) {
      const { networkId, isActiveNetwork } = getNetwork(+walletChainId)
      if (networkId && isActiveNetwork) {
        navigate(`${routeLocalePathname}/${networkId}/${routeFullPathname}`)
        updateConnectSwitchNetwork([routeChainId, +walletChainId])
      } else {
        updateConnectState('failure', CONNECT_STAGE.SWITCH_NETWORK)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletChainId, walletSignerAddress])

  // handle location pathname changes
  useEffect(() => {
    if (connectState.status !== 'success') return

    if (!isSameLocale) {
      updateLocale(routeLocale)
      updateWalletLocale(routeLocale)
    } else if (!isSameChainId.routeWallet && !!walletChainId) {
      // switch network if url network is not same as wallet
      updateConnectSwitchNetwork([+walletChainId, routeChainId])
    } else if (!isSameChainId.apiRoute && !!apiChainId) {
      // switch network if url network is not same as api
      updateConnectSwitchNetwork([apiChainId, routeChainId])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locationPathname])
}

export default useOnboardHelpers

export async function _isNetworkSwitched(newChainId: number) {
  try {
    if (!window?.ethereum) throw new Error('Ethereum object not found')

    const provider = new ethers.BrowserProvider(window.ethereum)
    const providerChainIdBigInt = (await provider.getNetwork())?.chainId
    const providerChainId = providerChainIdBigInt ? Number(providerChainIdBigInt) : null

    // TODO: check again if this is needed when @web3-onboard/core v2.21.2 is available.
    // https://github.com/blocknative/web3-onboard/issues/1907
    const deprecatedRequestChainIdHex = 'chainId' in window.ethereum ? (window.ethereum.chainId as string) : null
    const deprecatedRequestChainId = deprecatedRequestChainIdHex ? ethers.toNumber(deprecatedRequestChainIdHex) : null
    if (process.env.NODE_ENV === 'development')
      console.log('ONMOUNT SYNC STATUS:', newChainId, providerChainId, deprecatedRequestChainId)

    return {
      isNetworkSwitched: +newChainId === providerChainId,
      isWalletInSync: deprecatedRequestChainId ? providerChainId === deprecatedRequestChainId : true,
    }
  } catch (error) {
    console.error(error)
    return { isNetworkSwitched: true, isWalletInSync: true }
  }
}
