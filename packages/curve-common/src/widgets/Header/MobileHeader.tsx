import { AppBar, Toolbar } from '@mui/material'
import { Theme } from '@mui/system'
import { BaseHeaderProps, toolbarColors } from './types'
import React, { useCallback, useMemo, useState } from 'react'
import Drawer from '@mui/material/Drawer'
import { SidebarSection } from './SidebarSection'
import groupBy from 'lodash/groupBy'
import Box from '@mui/material/Box'
import { APP_LINK } from 'ui'
import { AppNames } from 'ui/src/AppNav/types'
import { HeaderStats } from './HeaderStats'
import { SocialSidebarSection } from './SocialSidebarSection'
import { SideBarFooter } from './SideBarFooter'
import { MobileTopBar } from './MobileTopBar'
import { DEFAULT_BAR_SIZE } from 'curve-ui-kit/src/entities/themes/model'

const SIDEBAR_WIDTH = {width: '100%', minWidth: 320} as const
const HIDE_SCROLLBAR = {
  // hide the scrollbar, on mobile it's not needed, and it messes up with the SideBarFooter
  '&::-webkit-scrollbar': { display: 'none' }, // chrome, safari, opera
  msOverflowStyle: 'none', // IE and Edge
  scrollbarWidth: 'none', // Firefox
}

const SECONDARY_BACKGROUND = {backgroundColor: (t: Theme) => toolbarColors[t.palette.mode][1]}
const zIndex = 1300

export const MobileHeader = <TChainId extends number>({
  currentApp,
  LanguageProps,
  pages,
  appStats,
  themes,
  sections,
  locale,
  translations: t,
  ChainProps,
  advancedMode,
  WalletProps: { onConnectWallet: startWalletConnection, ...WalletProps },
}: BaseHeaderProps<TChainId>) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const groupedPages = useMemo(() => groupBy(pages, (p) => p.groupedTitle), [pages])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const toggleSidebar = useCallback(() => setSidebarOpen((isOpen) => !isOpen), [])

  const onConnect = useCallback(() => {
    closeSidebar()
    startWalletConnection()
  }, [startWalletConnection, closeSidebar])

  return (
    <AppBar color="transparent" position="relative" sx={{ width: '100vw'}}>
      <Toolbar sx={SECONDARY_BACKGROUND}>
        <MobileTopBar
          ChainProps={ChainProps}
          currentApp={currentApp}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          sx={{zIndex}}
        />

        <Drawer
          anchor="left"
          onClose={closeSidebar}
          open={isSidebarOpen}
          PaperProps={{ sx: { top: DEFAULT_BAR_SIZE, ...SECONDARY_BACKGROUND, ...SIDEBAR_WIDTH, ...HIDE_SCROLLBAR } }}
          variant="temporary"
          hideBackdrop
        >
          <Box>
            <Box padding={4} display="flex" flexDirection="column">
              <HeaderStats appStats={appStats} />
            </Box>

            {Object.entries(groupedPages).map(([title, pages]) => (
              <SidebarSection title={title} key={title} pages={pages} />
            ))}

            <SidebarSection
              title={t.otherApps}
              pages={AppNames.filter((appName) => appName != currentApp).map((appName) => APP_LINK[appName])}
            />

            {sections.map(({ title, links }) => <SidebarSection key={title} title={title} pages={links} />)}

            <SocialSidebarSection title={t.socialMedia} locale={locale} />
          </Box>

          <SideBarFooter
            translations={t}
            LanguageProps={LanguageProps}
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

