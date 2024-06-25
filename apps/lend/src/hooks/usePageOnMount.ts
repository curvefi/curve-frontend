import type { Location, NavigateFunction, Params } from 'react-router'
import type { INetworkName } from '@curvefi/lending-api/lib/interfaces'

import { useCallback } from 'react'

import { ROUTE } from '@/constants'
import { dynamicActivate, updateAppLocale } from '@/lib/i18n'
import { parseParams } from '@/utils/utilsRouter'
import { helpers } from '@/lib/apiLending'
import { setStorageValue } from '@/utils/utilsStorage'
import { useOnboardHelpers } from '@/onboard'
import networks, { networksIdMapper } from '@/networks'
import useStore from '@/store/useStore'

function usePageOnMount(params: Params, location: Location, navigate: NavigateFunction, chainIdNotRequired?: boolean) {
  const api = useStore((state) => state.api)
  const connectState = useStore((state) => state.connectState)
  const updateConnectState = useStore((state) => state.updateConnectState)
  const updateCurveJs = useStore((state) => state.updateApi)
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

      const prevApi = api
      updateGlobalStoreByKey('isLoadingApi', true)
      updateGlobalStoreByKey('isLoadingCurve', true) // remove -> use connectState

      const newApi = await helpers.initApi(chainId as ChainId, wallet)
      if (!newApi) throw new Error('Unable to update api')

      await updateCurveJs(newApi, prevApi, wallet)
    },
    [api, updateCurveJs, updateGlobalStoreByKey, updateProvider]
  )

  const updateRouterProps = useCallback(() => {
    updateGlobalStoreByKey('routerProps', { params, location, navigate })
  }, [location, navigate, params, updateGlobalStoreByKey])

  const updateLocale = useCallback(
    async (locale: string) => {
      await dynamicActivate(locale)
      updateAppLocale(locale, updateGlobalStoreByKey)
      setStorageValue('APP_CACHE', { locale })
    },
    [updateGlobalStoreByKey]
  )

  useOnboardHelpers(
    `${parsedParams.rLocalePathname}/ethereum${ROUTE.PAGE_MARKETS}`,
    1,
    api,
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
    api,
  } as PageProps
}

export default usePageOnMount
