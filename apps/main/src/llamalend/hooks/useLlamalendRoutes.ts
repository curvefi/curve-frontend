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
export const getLendMarketId = (path: string) => {
  const [, app, , lendPage, marketId, marketType] = path.split('/')
  const lendRoutes = recordValues(LEND_MARKET_ROUTES).map(tr)

  return app === LEND_APP && lendPage === tr(LEND_ROUTES.PAGE_MARKETS) && lendRoutes.includes(marketType ?? '')
    ? marketId
    : null
}

export const useLendMarketSubNavRoutes = (): AppRoute[] => {
  const isLendMarketSubNav = useLendMarketSubNav()
  const pathname = usePathname()
  const lendMarketId = getLendMarketId(pathname)
  const marketPath = `${LEND_ROUTES.PAGE_MARKETS}/${lendMarketId}`

  return isLendMarketSubNav && lendMarketId
    ? [
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
    : []
}

export const useLlamalendRoutes = (): AppRoute[] => {
  const isMobile = useIsMobile()
  const lendRoutes = useLendMarketSubNavRoutes()

  return !isMobile && lendRoutes.length > 0 ? lendRoutes : APP_LINK.llamalend.routes
}
