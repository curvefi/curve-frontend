import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Stack from '@mui/material/Stack'
import { type Theme } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import { t } from '@ui-kit/lib/i18n'
import { APP_LINK, routeToPage } from '@ui-kit/shared/routes'
import { GlobalBanner } from '@ui-kit/shared/ui/GlobalBanner'
import { DEFAULT_BAR_SIZE, MOBILE_SIDEBAR_WIDTH } from '@ui-kit/themes/components'
import { HeaderStats } from './HeaderStats'
import { MobileTopBar } from './MobileTopBar'
import { SideBarFooter } from './SideBarFooter'
import { SidebarSection } from './SidebarSection'
import { SocialSidebarSection } from './SocialSidebarSection'
import { HeaderImplementationProps } from './types'

const HIDE_SCROLLBAR = {
  // hide the scrollbar, on mobile it's not needed, and it messes up with the SideBarFooter
  '&::-webkit-scrollbar': { display: 'none' }, // chrome, safari, opera
  msOverflowStyle: 'none', // IE and Edge
  scrollbarWidth: 'none', // Firefox
}

const paddingBlock = 3

/** Calculates the height of the mobile header */
export const calcMobileHeaderHeight = (theme: Theme) => `2 * ${theme.spacing(paddingBlock)} + ${DEFAULT_BAR_SIZE}`

export const MobileHeader = <TChainId extends number>({
  mainNavRef,
  currentMenu,
  pages,
  appStats,
  sections,
  chainId,
  chains,
  globalAlertRef,
  height,
  isLite = false,
  networkId,
}: HeaderImplementationProps<TChainId>) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const toggleSidebar = useCallback(() => setSidebarOpen((isOpen) => !isOpen), [])
  const pathname = usePathname()

  useEffect(() => () => closeSidebar(), [pathname, closeSidebar]) // close when URL changes due to clicking a link

  const otherAppSections = useMemo(
    () =>
      Object.entries(APP_LINK)
        .filter(([appName]) => appName != currentMenu)
        .map(([appName, { label, routes }]) => ({
          appName,
          title: label,
          pages: routes.map((p) => routeToPage(p, { networkId, pathname })),
        })),
    [currentMenu, networkId, pathname],
  )
  return (
    <>
      <AppBar color="transparent" ref={mainNavRef} sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
        <GlobalBanner networkId={networkId} ref={globalAlertRef} chainId={chainId} />
        <Toolbar sx={(t) => ({ paddingBlock, zIndex: t.zIndex.drawer + 1 })}>
          <MobileTopBar
            isLite={isLite}
            ChainProps={{ chainId, options: chains, headerHeight: height }}
            currentMenu={currentMenu}
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
          />

          <Drawer
            anchor="left"
            onClose={closeSidebar}
            open={isSidebarOpen}
            slotProps={{
              paper: {
                sx: {
                  top: height,
                  ...MOBILE_SIDEBAR_WIDTH,
                  ...HIDE_SCROLLBAR,
                },
              },
            }}
            sx={{ top: height }}
            variant="temporary"
            hideBackdrop
            data-testid="mobile-drawer"
          >
            <Box>
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
            </Box>

            <SideBarFooter onConnect={closeSidebar} />
          </Drawer>
        </Toolbar>
      </AppBar>

      {/* create an empty box to take the place behind the header */}
      <Box height={height} />
    </>
  )
}
