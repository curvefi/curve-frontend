import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import { BaseHeaderProps } from './types'
import { useCallback, useEffect, useState } from 'react'
import Drawer from '@mui/material/Drawer'
import { SidebarSection } from './SidebarSection'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import { type Theme } from '@mui/material/styles'
import { HeaderStats } from './HeaderStats'
import { SocialSidebarSection } from './SocialSidebarSection'
import { SideBarFooter } from './SideBarFooter'
import { MobileTopBar } from './MobileTopBar'
import { APP_LINK, AppName, externalAppUrl } from '@ui-kit/shared/routes'
import { t } from '@ui-kit/lib/i18n'
import GlobalBanner from '@ui/Banner'
import { DEFAULT_BAR_SIZE, MOBILE_SIDEBAR_WIDTH } from '@ui-kit/themes/components'
import { usePathname } from 'next/navigation'

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
  currentApp,
  pages,
  appStats,
  sections,
  ChainProps,
  BannerProps,
  height,
  isLite = false,
  networkName,
  WalletProps: { onConnectWallet: startWalletConnection, ...WalletProps },
}: BaseHeaderProps<TChainId>) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const toggleSidebar = useCallback(() => setSidebarOpen((isOpen) => !isOpen), [])
  const pathname = usePathname()

  useEffect(() => () => closeSidebar(), [pathname, closeSidebar]) // close when clicking a link

  const onConnect = useCallback(() => {
    closeSidebar()
    startWalletConnection()
  }, [startWalletConnection, closeSidebar])

  return (
    <>
      <AppBar color="transparent" ref={mainNavRef} sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
        <GlobalBanner {...BannerProps} />
        <Toolbar sx={(t) => ({ paddingBlock, zIndex: t.zIndex.drawer + 1 })}>
          <MobileTopBar
            isLite={isLite}
            ChainProps={{ ...ChainProps, headerHeight: height }}
            currentApp={currentApp}
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

              <SidebarSection title={APP_LINK[currentApp].label} pages={pages} />

              {Object.entries(APP_LINK)
                .filter(([appName]) => appName != currentApp)
                .map(([appName, { label, pages }]) => (
                  <SidebarSection
                    key={appName}
                    title={label}
                    pages={pages.map(({ route, label }) => ({
                      label: label(),
                      route: externalAppUrl(route, networkName, appName as AppName),
                    }))}
                  />
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
