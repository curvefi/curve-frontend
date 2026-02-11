import type { UrlParams } from '@/lend/types/lend.types'
import { useLendMarketSubNavRoutes } from '@/llamalend/hooks/useLlamalendRoutes'
import Box from '@mui/material/Box'
import { useLayoutStore } from '@ui-kit/features/layout'
import { usePathname, useParams } from '@ui-kit/hooks/router'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { useLendMarketSubNav } from '@ui-kit/hooks/useFeatureFlags'
import { routeToPage } from '@ui-kit/shared/routes'
import { PageTabsSwitcher } from '@ui-kit/widgets/Header/PageTabsSwitcher'
import { SubNav } from '@ui-kit/widgets/Header/SubNav'

export const LendMarketSubNav = () => {
  const isMobile = useIsMobile()
  const isLendMarketSubNav = useLendMarketSubNav()
  const { network: networkId } = useParams<UrlParams>()
  const pathname = usePathname()
  const top = useLayoutStore((state) => state.navHeight)
  const routes = useLendMarketSubNavRoutes()

  const pages = routes.map((route) => routeToPage(route, { networkId, pathname }))

  return (
    isMobile &&
    isLendMarketSubNav &&
    pages.length > 0 && (
      <Box sx={{ position: 'sticky', top, zIndex: (t) => t.zIndex.appBar }}>
        <SubNav testId="lend-market-subnav">
          <PageTabsSwitcher pages={pages} overflow="fullWidth" />
        </SubNav>
      </Box>
    )
  )
}
