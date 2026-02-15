import { useMatchRoute } from '@tanstack/react-router'
import { useIsDesktop } from '@ui-kit/hooks/useBreakpoints'
import { useLendMarketSubNav } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { LEND_MARKET_ROUTES } from '@ui-kit/shared/routes'
import { APP_LINK, type AppName, LEND_ROUTES } from '@ui-kit/shared/routes'
import type { AppRoute } from '@ui-kit/widgets/Header/types'

const LEND_APP: AppName = 'lend'
const CRVUSD_APP: AppName = 'crvusd'

const buildLendMarketPath = ({ marketId, marketType }: { marketId: string; marketType: string }) =>
  `${LEND_ROUTES.PAGE_MARKETS}/${marketId}${marketType}`

/** Returns the routes for the Llamalend market subnav.
 * For the llamalend app it's the "Markets", "Savings crvUSD" and "Peg Stability Reserves" routes
 * For the lend app it's the "Borrow" and "Supply" routes
 * For the crvusd app it's empty array (default to Borrow page, no need for the subnav)
 */
export const useLlamalendMarketSubNavRoutes = (): AppRoute[] => {
  const matchRoute = useMatchRoute()
  // Returns the params if the current pathname matches the given route, else returns false
  // Cast the return type because it's "false" by default
  const params = matchRoute({
    to: `$app/$network${LEND_ROUTES.PAGE_MARKETS}/$marketId`,
    fuzzy: true,
  }) as Record<string, string> | false

  switch (params && params.app) {
    case LEND_APP:
      return [
        {
          app: LEND_APP,
          route: buildLendMarketPath({
            marketId: (params as Record<string, string>).marketId,
            marketType: LEND_MARKET_ROUTES.PAGE_LOAN,
          }),
          label: () => t`Borrow`,
          matchMode: 'exact',
        },
        {
          app: LEND_APP,
          route: buildLendMarketPath({
            marketId: (params as Record<string, string>).marketId,
            marketType: LEND_MARKET_ROUTES.PAGE_VAULT,
          }),
          label: () => t`Supply`,
          matchMode: 'exact',
        },
      ]
    case CRVUSD_APP:
      return []
    default:
      return APP_LINK.llamalend.routes
  }
}

export const useLlamalendRoutes = (): AppRoute[] => {
  const isDesktop = useIsDesktop()
  const llamalendMarketRoutes = useLlamalendMarketSubNavRoutes()
  const isLendMarketSubNav = useLendMarketSubNav()

  return isDesktop && isLendMarketSubNav ? llamalendMarketRoutes : APP_LINK.llamalend.routes
}
