import type { UrlParams } from '@/lend/types/lend.types'
import { useLlamalendMarketSubNavRoutes } from '@/llamalend/hooks/useLlamalendRoutes'
import Box from '@mui/material/Box'
import { useLayoutStore } from '@ui-kit/features/layout'
import { usePathname, useParams } from '@ui-kit/hooks/router'
import { useIsDesktop } from '@ui-kit/hooks/useBreakpoints'
import { useLendMarketSubNav } from '@ui-kit/hooks/useFeatureFlags'
import { routeToPage } from '@ui-kit/shared/routes'
import { PageTabsSwitcher } from '@ui-kit/widgets/Header/PageTabsSwitcher'
import { SubNav } from '@ui-kit/widgets/Header/SubNav'

export const LendMarketSubNavMobile = () => {
  const isDesktop = useIsDesktop()
  const isLendMarketSubNav = useLendMarketSubNav()
  const { network: networkId } = useParams<UrlParams>()
  const pathname = usePathname()
  const top = useLayoutStore((state) => state.navHeight)
  const routes = useLlamalendMarketSubNavRoutes({ isMobile: true })

  return (
    !isDesktop &&
    isLendMarketSubNav &&
    routes.length > 0 && (
      <Box sx={{ position: 'sticky', top, zIndex: (t) => t.zIndex.appBar }}>
        <SubNav testId="lend-market-subnav">
          <PageTabsSwitcher
            pages={routes.map((route) => routeToPage(route, { networkId, pathname }))}
            overflow="fullWidth"
          />
        </SubNav>
      </Box>
    )
  )
}
