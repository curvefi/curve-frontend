import type { UrlParams } from '@/lend/types/lend.types'
import { useLlamalendMarketSubNavRoutes } from '@/llamalend/hooks/useLlamalendRoutes'
import Portal from '@mui/material/Portal'
import { usePathname, useParams } from '@ui-kit/hooks/router'
import { useIsDesktop } from '@ui-kit/hooks/useBreakpoints'
import { routeToPage } from '@ui-kit/shared/routes'
import { PageTabsSwitcher } from '@ui-kit/widgets/Header/PageTabsSwitcher'
import { SubNav } from '@ui-kit/widgets/Header/SubNav'

export const LendMarketSubNavMobile = () => {
  const isDesktop = useIsDesktop()
  const { network: networkId } = useParams<UrlParams>()
  const pathname = usePathname()
  const routes = useLlamalendMarketSubNavRoutes({ isMobile: true })

  return (
    !isDesktop &&
    routes.length > 0 && (
      <Portal container={() => document.getElementsByTagName('header').item(0)}>
        <SubNav testId="lend-market-subnav">
          <PageTabsSwitcher
            pages={routes.map(route => routeToPage(route, { networkId, pathname }))}
            overflow="fullWidth"
          />
        </SubNav>
      </Portal>
    )
  )
}
