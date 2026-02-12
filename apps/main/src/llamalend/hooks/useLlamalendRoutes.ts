import { recordValues } from '@curvefi/prices-api/objects.util'
import { usePathname } from '@ui-kit/hooks/router'
import { useIsDesktop } from '@ui-kit/hooks/useBreakpoints'
import { useLendMarketSubNav } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { LEND_MARKET_ROUTES } from '@ui-kit/shared/routes'
import { APP_LINK, type AppName, LEND_ROUTES } from '@ui-kit/shared/routes'
import type { AppRoute } from '@ui-kit/widgets/Header/types'

const LEND_APP: AppName = 'lend'
const CRVUSD_APP: AppName = 'crvusd'

/** Trim the leading slash from a string. "/vault" -> "vault" */
const tr = (value: string) => value.replace(/^\//, '')

export const useLlamalendMarketSubNavRoutes = (): AppRoute[] | null => {
  const pathname = usePathname()
  const [, app, , page, marketId, marketType] = pathname.split('/')
  const lendRoutes = recordValues(LEND_MARKET_ROUTES).map(tr)

  // Check if the current path is a llamalend market page.
  const isLlamalendMarket =
    ([LEND_APP, CRVUSD_APP] as readonly string[]).includes(app) &&
    page === tr(LEND_ROUTES.PAGE_MARKETS) &&
    marketId &&
    lendRoutes.includes(marketType ?? '')

  if (!isLlamalendMarket) return null

  const marketPath = `${LEND_ROUTES.PAGE_MARKETS}/${marketId}`
  return app === LEND_APP
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
  const isDesktop = useIsDesktop()
  const llamalendMarketRoutes = useLlamalendMarketSubNavRoutes()
  const isLendMarketSubNav = useLendMarketSubNav()

  return isDesktop && isLendMarketSubNav && llamalendMarketRoutes !== null
    ? llamalendMarketRoutes
    : APP_LINK.llamalend.routes
}
