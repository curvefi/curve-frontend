import { useMemo } from 'react'
import { recordValues } from '@curvefi/prices-api/objects.util'
import { usePathname } from '@ui-kit/hooks/router'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { useLendMarketSubNav } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { LEND_MARKET_ROUTES } from '@ui-kit/shared/routes'
import { APP_LINK, type AppName, LEND_ROUTES } from '@ui-kit/shared/routes'
import type { AppRoute } from '@ui-kit/widgets/Header/types'

const LEND_APP: AppName = 'lend'

/** Trim the leading slash from a string. "/vault" -> "vault" */
const tr = (value: string) => value.replace(/^\//, '')

/** Get the market ID of a lend market page. */
const getLendMarketId = (path: string) => {
  const [, , , lendPage, marketId, marketType] = path.split('/')
  const lendRoutes = recordValues(LEND_MARKET_ROUTES).map(tr)
  return lendPage === tr(LEND_ROUTES.PAGE_MARKETS) && lendRoutes.includes(marketType ?? '') ? marketId : null
}

export const useLlamalendRoutes = (currentApp: AppName): AppRoute[] => {
  const isLendMarketSubNav = useLendMarketSubNav()
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const lendMarketId = getLendMarketId(pathname)

  return useMemo(() => {
    if (currentApp === LEND_APP && isLendMarketSubNav && !isMobile && lendMarketId) {
      const marketPath = `${LEND_ROUTES.PAGE_MARKETS}/${lendMarketId}`
      return [
        {
          app: LEND_APP,
          route: `${marketPath}${LEND_MARKET_ROUTES.PAGE_LOAN}`,
          label: () => t`Borrow`,
          matchMode: 'exact',
        },
        {
          app: LEND_APP,
          route: `${marketPath}${LEND_MARKET_ROUTES.PAGE_VAULT}`,
          label: () => t`Supply`,
          matchMode: 'exact',
        },
      ]
    }
    return APP_LINK.llamalend.routes
  }, [currentApp, isLendMarketSubNav, lendMarketId, isMobile])
}
