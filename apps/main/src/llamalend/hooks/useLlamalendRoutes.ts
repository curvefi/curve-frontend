import { useMatchRoute } from '@tanstack/react-router'
import { useIsDesktop } from '@ui-kit/hooks/useBreakpoints'
import { useLendMarketSubNav } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { LEND_MARKET_ROUTES } from '@ui-kit/shared/routes'
import { APP_LINK, type AppName, LEND_ROUTES } from '@ui-kit/shared/routes'
import type { AppRoute } from '@ui-kit/widgets/Header/types'

const LEND_APP: AppName = 'lend'
const CRVUSD_APP: AppName = 'crvusd'

// TODO: duplicate of getVaultPathname and getLoanPathname in @/lend/utils/utilsRouter.ts and in llamalend/queries/market-list/llama-markets.ts.
// First they need to be refactored outside the lend app.
const buildLendMarketPath = ({ marketId, action }: { marketId: string; action: string }) =>
  `${LEND_ROUTES.PAGE_MARKETS}/${marketId}${action}`

/** Returns the routes for the Llamalend market subnav.
 * For the llamalend app it's the "Markets", "Savings crvUSD" and "Peg Stability Reserves" routes
 * For the lend app it's the "Borrow" and "Supply" routes
 * For the crvusd app it's empty array (default to Borrow page, no need for the subnav)
 */
export const useLlamalendMarketSubNavRoutes = ({ isMobile }: { isMobile: boolean }): AppRoute[] => {
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
            action: LEND_MARKET_ROUTES.PAGE_LOAN,
          }),
          label: () => t`Borrow`,
          matchMode: 'exact',
        },
        {
          app: LEND_APP,
          route: buildLendMarketPath({
            marketId: (params as Record<string, string>).marketId,
            action: LEND_MARKET_ROUTES.PAGE_VAULT,
          }),
          label: () => t`Supply`,
          matchMode: 'exact',
        },
      ]
    case CRVUSD_APP:
      return []
    default:
      // Subnav not needed for mobile outside of the markets page
      if (isMobile) {
        return []
      }
      return APP_LINK.llamalend.routes
  }
}

export const useLlamalendRoutes = (): AppRoute[] => {
  const isDesktop = useIsDesktop()
  const llamalendMarketRoutes = useLlamalendMarketSubNavRoutes({ isMobile: false })
  const isLendMarketSubNav = useLendMarketSubNav()

  return isDesktop && isLendMarketSubNav ? llamalendMarketRoutes : APP_LINK.llamalend.routes
}
