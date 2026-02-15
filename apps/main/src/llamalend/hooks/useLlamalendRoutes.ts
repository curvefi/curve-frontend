import { recordValues } from '@curvefi/prices-api/objects.util'
import { useMatchRoute } from '@tanstack/react-router'
import { useIsDesktop } from '@ui-kit/hooks/useBreakpoints'
import { useLendMarketSubNav } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { LEND_MARKET_ROUTES } from '@ui-kit/shared/routes'
import { APP_LINK, type AppName, LEND_ROUTES } from '@ui-kit/shared/routes'
import type { AppRoute } from '@ui-kit/widgets/Header/types'

/** Trim the leading slash from a string. "/vault" -> "vault" */
const tr = (value: string) => value.replace(/^\//, '')

const LEND_APP: AppName = 'lend'
const LEND_MARKET_ROUTES_VALUES = recordValues<string, string>(LEND_MARKET_ROUTES).map(tr)

const buildLendMarketPath = ({ marketId, marketType }: { marketId: string; marketType: string }) =>
  `${LEND_ROUTES.PAGE_MARKETS}/${marketId}${marketType}`

/** Returns the routes for the Llamalend market subnav.
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

  return params &&
    params?.app === LEND_APP &&
    // params?.['**'] catches the rest of the pathname after the marketId.
    // If undefined, it's the Borrow page and "vault" is for Supply page
    LEND_MARKET_ROUTES_VALUES.includes(params?.['**'] ?? '')
    ? [
        {
          app: LEND_APP,
          route: buildLendMarketPath({ marketId: params.marketId, marketType: LEND_MARKET_ROUTES.PAGE_LOAN }),
          label: () => t`Borrow`,
          matchMode: 'exact',
        },
        {
          app: LEND_APP,
          route: buildLendMarketPath({ marketId: params.marketId, marketType: LEND_MARKET_ROUTES.PAGE_VAULT }),
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

  return isDesktop && isLendMarketSubNav ? llamalendMarketRoutes : APP_LINK.llamalend.routes
}
