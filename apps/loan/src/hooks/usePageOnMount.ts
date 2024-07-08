import type { Location, NavigateFunction, Params } from 'react-router'
import type { INetworkName } from '@curvefi/stablecoin-api/lib/interfaces'

import { useCallback } from 'react'

import { ROUTE } from '@/constants'
import { dynamicActivate, updateAppLocale } from '@/lib/i18n'
import { setStorageValue } from '@/utils/storage'
import { parseParams } from '@/utils/utilsRouter'
import { initCurveJs } from '@/utils/utilsCurvejs'
import { useOnboardHelpers } from '@/onboard'
import networks, { networksIdMapper } from '@/networks'
import useStore from '@/store/useStore'

function usePageOnMount(params: Params, location: Location, navigate: NavigateFunction, chainIdNotRequired?: boolean) {
  const curve = useStore((state) => state.curve)
  const connectState = useStore((state) => state.connectState)
  const updateConnectState = useStore((state) => state.updateConnectState)
  const updateCurveJs = useStore((state) => state.updateCurveJs)
  const updateProvider = useStore((state) => state.wallet.updateProvider)
  const updateGlobalStoreByKey = useStore((state) => state.updateGlobalStoreByKey)

  const parsedParams = parseParams(params, chainIdNotRequired)
  const { network: paramsNetwork } = params

  const getNetwork = useCallback((chainId: number) => {
    const { id: networkId = null, isActiveNetwork = false } = networks[chainId as ChainId] ?? {}
    return { networkId, isActiveNetwork }
  }, [])

  const updateApi = useCallback(
    async (chainId: number, wallet: Wallet | null) => {
      await updateProvider(wallet)

      const prevApi = curve
      updateGlobalStoreByKey('isLoadingApi', true)
      updateGlobalStoreByKey('isLoadingCurve', true) // remove -> use connectState

      const updatedApi = await initCurveJs(chainId as ChainId, wallet)
      if (!updatedApi) throw new Error('Unable to update api')

      const parsedApi: Curve = { ...updatedApi, chainId: 1 }
      await updateCurveJs(parsedApi, prevApi, wallet)
    },
    [curve, updateCurveJs, updateGlobalStoreByKey, updateProvider]
  )

  const updateRouterProps = useCallback(() => {
    updateGlobalStoreByKey('routerProps', { params, location, navigate })
  }, [location, navigate, params, updateGlobalStoreByKey])

  const updateLocale = useCallback(
    (locale: string) => {
      dynamicActivate(locale)
      updateAppLocale(locale, updateGlobalStoreByKey)
      setStorageValue('APP_CACHE', { locale })
    },
    [updateGlobalStoreByKey]
  )

  useOnboardHelpers(
    `${parsedParams.rLocalePathname}/ethereum${ROUTE.PAGE_MARKETS}`,
    1,
    curve,
    parsedParams,
    paramsNetwork ? networksIdMapper[paramsNetwork as INetworkName] : null,
    location.pathname === ROUTE.PAGE_INTEGRATIONS,
    connectState,
    getNetwork,
    updateApi,
    updateConnectState,
    updateLocale,
    updateRouterProps
  )

  return {
    pageLoaded: connectState.status === 'success',
    routerParams: parsedParams,
    curve,
  } as PageProps
}

export default usePageOnMount
