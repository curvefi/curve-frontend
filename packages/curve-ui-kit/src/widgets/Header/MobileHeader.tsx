import { useCallback, useEffect, useMemo, useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Drawer from '@mui/material/Drawer'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import { useLayoutStore } from '@ui-kit/features/layout'
import { usePathname } from '@ui-kit/hooks/router'
import { useLendMarketSubNav } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { APP_LINK, routeToPage } from '@ui-kit/shared/routes'
import { GlobalBanner } from '@ui-kit/shared/ui/GlobalBanner'
import { MOBILE_SIDEBAR_WIDTH } from '@ui-kit/themes/components'
import { HeaderStats } from './HeaderStats'
import { LendMarketSubNav } from './LendMarketSubNav'
import { MobileTopBar } from './MobileTopBar'
import { SideBarFooter } from './SideBarFooter'
import { SidebarSection } from './SidebarSection'
import { SocialSidebarSection } from './SocialSidebarSection'
import { HeaderImplementationProps } from './types'
import { useMainNavRef } from './useMainNavRef'
import { useVisibleAppLinks } from './useVisibleAppLinks'

const HIDE_SCROLLBAR = {
  // hide the scrollbar, on mobile it's not needed, and it messes up with the SideBarFooter
  '&::-webkit-scrollbar': { display: 'none' }, // chrome, safari, opera
  msOverflowStyle: 'none', // IE and Edge
  scrollbarWidth: 'none', // Firefox
}

const paddingBlock = 3

export const MobileHeader = ({
  currentMenu,
  pages,
  appStats,
  sections,
  chainId,
  supportedNetworks,
  networkId,
}: HeaderImplementationProps) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const toggleSidebar = useCallback(() => setSidebarOpen((isOpen) => !isOpen), [])
  const pathname = usePathname()
  const top = useLayoutStore((state) => state.navHeight)
  const appLinks = useVisibleAppLinks()
  const showLendMarketSubNav = useLendMarketSubNav()

  useEffect(() => () => closeSidebar(), [pathname, closeSidebar]) // close when URL changes due to clicking a link

  const otherAppSections = useMemo(
    () =>
      appLinks
        .filter(([appName]) => appName != currentMenu)
        .map(([appName, { label, routes }]) => ({
          appName,
          title: label,
          pages: routes.map((p) => routeToPage(p, { networkId, pathname })),
        })),
    [appLinks, currentMenu, networkId, pathname],
  )
  return (
    <AppBar
      color="transparent"
      ref={useMainNavRef()}
      sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, position: 'sticky', top: 0, boxShadow: 'none' }}
      data-testid="mobile-main-bar"
    >
      <GlobalBanner networkId={networkId} chainId={chainId} />
      <Toolbar sx={(t) => ({ paddingBlock, zIndex: t.zIndex.drawer + 1 })}>
        <MobileTopBar networks={supportedNetworks} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

        <Drawer
          anchor="left"
          onClose={closeSidebar}
          open={isSidebarOpen}
          slotProps={{
            paper: {
              sx: {
                top,
                ...MOBILE_SIDEBAR_WIDTH,
                ...HIDE_SCROLLBAR,
                height: `calc(100dvh - ${top}px)`,
              },
            },
          }}
          sx={{ top }}
          variant="temporary"
          hideBackdrop
          data-testid="mobile-drawer"
        >
          <Stack sx={{ overflowY: 'auto', ...HIDE_SCROLLBAR }}>
            <Stack padding={4}>
              <HeaderStats appStats={appStats} />
            </Stack>

            <SidebarSection title={APP_LINK[currentMenu].label} pages={pages} />

            {otherAppSections.map(({ appName, ...props }) => (
              <SidebarSection key={appName} {...props} />
            ))}

            {sections.map(({ title, links }) => (
              <SidebarSection key={title} title={title} pages={links} />
            ))}

            <SocialSidebarSection title={t`Community`} />
          </Stack>

          <SideBarFooter onConnect={closeSidebar} />
        </Drawer>
      </Toolbar>
      {showLendMarketSubNav && <LendMarketSubNav />}
    </AppBar>
  )
}
