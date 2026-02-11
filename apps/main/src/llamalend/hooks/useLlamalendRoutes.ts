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

export const useLendMarketSubNavRoutes = (): AppRoute[] => {
  const pathname = usePathname()

  const [, app, , lendPage, marketId, marketType] = pathname.split('/')
  const lendRoutes = recordValues(LEND_MARKET_ROUTES).map(tr)

  const marketPath = `${LEND_ROUTES.PAGE_MARKETS}/${marketId}`

  return app === LEND_APP && lendPage === tr(LEND_ROUTES.PAGE_MARKETS) && lendRoutes.includes(marketType ?? '')
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
  const isLendMarketSubNav = useLendMarketSubNav()

  return !isMobile && isLendMarketSubNav ? lendRoutes : APP_LINK.llamalend.routes
}
