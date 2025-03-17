import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Stack from '@mui/material/Stack'
import { type Theme } from '@mui/material/styles'
import Toolbar from '@mui/material/Toolbar'
import GlobalBanner from '@ui/Banner'
import { t } from '@ui-kit/lib/i18n'
import { APP_LINK, routeToPage } from '@ui-kit/shared/routes'
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
  ChainProps,
  BannerProps,
  height,
  isLite = false,
  networkName,
  WalletProps: { onConnectWallet: startWalletConnection, ...WalletProps },
}: HeaderImplementationProps<TChainId>) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const toggleSidebar = useCallback(() => setSidebarOpen((isOpen) => !isOpen), [])
  const pathname = usePathname()

  useEffect(() => () => closeSidebar(), [pathname, closeSidebar]) // close when clicking a link

  const onConnect = useCallback(() => {
    closeSidebar()
    startWalletConnection()
  }, [startWalletConnection, closeSidebar])

  const otherAppSections = useMemo(
    () =>
      Object.entries(APP_LINK)
        .filter(([appName]) => appName != currentMenu)
        .map(([appName, { label, pages }]) => ({
          appName,
          title: label,
          pages: pages.map((p) => routeToPage(p, { networkName, pathname })),
        })),
    [currentMenu, networkName, pathname],
  )
  return (
    <>
      <AppBar color="transparent" ref={mainNavRef} sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
        <GlobalBanner {...BannerProps} />
        <Toolbar sx={(t) => ({ paddingBlock, zIndex: t.zIndex.drawer + 1 })}>
          <MobileTopBar
            isLite={isLite}
            ChainProps={{ ...ChainProps, headerHeight: height }}
            currentMenu={currentMenu}
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
          />

          <Drawer
            anchor="left"
            onClose={closeSidebar}
            open={isSidebarOpen}
            PaperProps={{
              sx: {
                top: height,
                ...MOBILE_SIDEBAR_WIDTH,
                ...HIDE_SCROLLBAR,
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

            <SideBarFooter WalletProps={{ ...WalletProps, onConnectWallet: onConnect }} />
          </Drawer>
        </Toolbar>
      </AppBar>

      {/* create an empty box to take the place behind the header */}
      <Box height={height} />
    </>
  )
}
