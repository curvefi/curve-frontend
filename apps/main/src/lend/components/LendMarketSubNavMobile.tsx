import type { UrlParams } from '@/lend/types/lend.types'
import { useLlamalendMarketSubNavRoutes } from '@/llamalend/hooks/useLlamalendRoutes'
import { routeToPage } from '@evm-ui/shared/routes'
import Portal from '@mui/material/Portal'
import { PageTabsSwitcher } from '@ui/features/layout/Header/PageTabsSwitcher'
import { SubNav } from '@ui/features/layout/Header/SubNav'
import { usePathname, useParams } from '@ui/hooks/router'
import { useIsDesktop } from '@ui/hooks/useBreakpoints'

export const LendMarketSubNavMobile = () => {
  const isDesktop = useIsDesktop()
  const { network: blockchainId } = useParams<UrlParams>()
  const pathname = usePathname()
  const routes = useLlamalendMarketSubNavRoutes({ isMobile: true })

  return (
    !isDesktop &&
    routes.length > 0 && (
      <Portal container={() => document.getElementsByTagName('header').item(0)}>
        <SubNav testId="lend-market-subnav">
          <PageTabsSwitcher
            pages={routes.map(route => routeToPage(route, { blockchainId, pathname }))}
            overflow="fullWidth"
          />
        </SubNav>
      </Portal>
    )
  )
}
