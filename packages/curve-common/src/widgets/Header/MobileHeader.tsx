import { AppBar, Toolbar } from '@mui/material'
import { BaseHeaderProps } from './types'
import React, { useCallback, useEffect, useState } from 'react'
import Drawer from '@mui/material/Drawer'
import { SidebarSection } from './SidebarSection'
import Box from '@mui/material/Box'
import { type Theme } from '@mui/material/styles'
import { HeaderStats } from './HeaderStats'
import { SocialSidebarSection } from './SocialSidebarSection'
import { SideBarFooter } from './SideBarFooter'
import { MobileTopBar } from './MobileTopBar'
import { DEFAULT_BAR_SIZE } from 'curve-ui-kit/src/themes/components'
import { useLocation } from 'react-router-dom'
import { APP_LINK, AppName, externalAppUrl } from 'curve-ui-kit/src/shared/routes'
import { t } from '@lingui/macro'

const SIDEBAR_WIDTH = { width: '100%', minWidth: 320 } as const
const HIDE_SCROLLBAR = {
  // hide the scrollbar, on mobile it's not needed, and it messes up with the SideBarFooter
  '&::-webkit-scrollbar': { display: 'none' }, // chrome, safari, opera
  msOverflowStyle: 'none', // IE and Edge
  scrollbarWidth: 'none', // Firefox
}

const SECONDARY_BACKGROUND = { backgroundColor: (t: Theme) => t.design.Layer.App.Background }
const zIndex = 1300

export const MobileHeader = <TChainId extends number>({
  mainNavRef,
  currentApp,
  pages,
  appStats,
  themes,
  sections,
  locale,
  ChainProps,
  isLite = false,
  advancedMode,
  WalletProps: { onConnectWallet: startWalletConnection, ...WalletProps },
}: BaseHeaderProps<TChainId>) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const toggleSidebar = useCallback(() => setSidebarOpen((isOpen) => !isOpen), [])
  const { pathname } = useLocation()

  useEffect(() => () => closeSidebar(), [pathname, closeSidebar]) // close when clicking a link

  const onConnect = useCallback(() => {
    closeSidebar()
    startWalletConnection()
  }, [startWalletConnection, closeSidebar])

  return (
    <AppBar color="transparent" position="relative" sx={{ width: '100vw' }} ref={mainNavRef}>
      <Toolbar sx={{ ...SECONDARY_BACKGROUND, paddingY: 3 }}>
        <MobileTopBar
          isLite={isLite}
          ChainProps={ChainProps}
          currentApp={currentApp}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          sx={{ zIndex }}
        />

        <Drawer
          anchor="left"
          onClose={closeSidebar}
          open={isSidebarOpen}
          PaperProps={{
            sx: {
              top: (t) => `calc(2 * ${t.spacing(3)} + ${DEFAULT_BAR_SIZE})`,
              ...SECONDARY_BACKGROUND,
              ...SIDEBAR_WIDTH,
              ...HIDE_SCROLLBAR,
            },
          }}
          variant="temporary"
          hideBackdrop
          data-testid="mobile-drawer"
        >
          <Box>
            <Box padding={4} display="flex" flexDirection="column">
              <HeaderStats appStats={appStats} />
            </Box>

            <SidebarSection title={APP_LINK[currentApp].label} pages={pages} />

            {Object.entries(APP_LINK)
              .filter(([appName]) => appName != currentApp)
              .map(([appName, { label, pages }]) => (
                <SidebarSection
                  key={appName}
                  title={label}
                  pages={pages.map(({ route, label }) => ({
                    label: label(),
                    route: externalAppUrl(route, appName as AppName),
                  }))}
                />
              ))}

            {sections.map(({ title, links }) => (
              <SidebarSection key={title} title={title} pages={links} />
            ))}

            <SocialSidebarSection title={t`Community`} locale={locale} />
          </Box>

          <SideBarFooter
            themes={themes}
            advancedMode={advancedMode}
            WalletProps={{ ...WalletProps, onConnectWallet: onConnect }}
            sx={{ ...SIDEBAR_WIDTH, zIndex }}
          />
        </Drawer>
      </Toolbar>
    </AppBar>
  )
}
