import type { Location, NavigateFunction, Params } from 'react-router'

import { useEffect, useState } from 'react'
import { useSetLocale } from 'onboard-helpers'

import { ROUTE } from '@/constants'
import { dynamicActivate, updateAppLocale } from '@/lib/i18n'
import { parseParams } from '@/utils/utilsRouter'
import useStore from '@/store/useStore'

function usePageOnMount(params: Params, location: Location, navigate: NavigateFunction, chainIdNotRequired?: boolean) {
  const updateWalletLocale = useSetLocale()
  const updateGlobalStoreByKey = useStore((state) => state.updateGlobalStoreByKey)
  const storedLocale = useStore((state) => state.locale)

  const [loaded, setLoaded] = useState(false)

  const { locale } = params
  const { rChainId, rLocale } = parseParams(params, location)

  useEffect(() => {
    setLoaded(false)
  }, [])

  useEffect(() => {
    if (!chainIdNotRequired && !rChainId) {
      navigate(ROUTE.PAGE_404)
    } else if (locale && locale !== rLocale.parsedLocale) {
      const redirectPathname = location.pathname.replace(
        `/${locale}`,
        rLocale.pathnameLocale ? `/${rLocale.pathnameLocale}` : ''
      )
      navigate(redirectPathname)
    } else if (storedLocale !== rLocale.parsedLocale) {
      dynamicActivate(rLocale.parsedLocale)
      updateAppLocale(rLocale.parsedLocale, updateGlobalStoreByKey)
      updateWalletLocale(rLocale.parsedLocale)
    }

    updateGlobalStoreByKey('routerAppNetworkId', rChainId || null)
    updateGlobalStoreByKey('routerProps', { params, location, navigate })
    setLoaded(true)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rChainId, rLocale])

  return loaded
}

export default usePageOnMount
