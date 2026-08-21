import type { UrlParams } from '@/lend/types/lend.types'
import { useLlamalendMarketSubNavRoutes } from '@/llamalend/hooks/useLlamalendRoutes'
import { usePathname, useParams } from '@evm-ui/hooks/router'
import { useIsDesktop } from '@evm-ui/hooks/useBreakpoints'
import { routeToPage } from '@evm-ui/shared/routes'
import { PageTabsSwitcher } from '@evm-ui/widgets/Header/PageTabsSwitcher'
import { SubNav } from '@evm-ui/widgets/Header/SubNav'
import Portal from '@mui/material/Portal'

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
