import { AppBar, Toolbar } from '@mui/material'
import { Theme } from '@mui/system'
import { BaseHeaderProps, toolbarColors } from './types'
import IconButton from '@mui/material/IconButton'
import React, { useCallback, useMemo, useState } from 'react'
import Drawer from '@mui/material/Drawer'
import { SidebarSection } from './SidebarSection'
import groupBy from 'lodash/groupBy'
import Box from '@mui/material/Box'
import { ChainSwitcher, ChainSwitcherProps } from '../../features/switch-chain'
import { APP_LINK } from 'ui'
import { AppName, AppNames } from 'ui/src/AppNav/types'
import CloseIcon from '@mui/icons-material/Close'
import { HeaderStats } from './HeaderStats'
import { SocialSidebarSection } from './SocialSidebarSection'
import { SideBarFooter } from './SideBarFooter'
import { HeaderLogo } from './HeaderLogo'
import MenuIcon from '@mui/icons-material/Menu'

const SIDEBAR_WIDTH = {width: '80%', minWidth: 320, maxWidth: 400} as const
const HIDE_SCROLLBAR = {
  // hide the scrollbar, on mobile it's not needed, and it messes up with the SideBarFooter
  '&::-webkit-scrollbar': { display: 'none' }, // chrome, safari, opera
  msOverflowStyle: 'none', // IE and Edge
  scrollbarWidth: 'none', // Firefox
}

const MAIN_BACKGROUND = {backgroundColor: (t: Theme) => toolbarColors[t.palette.mode][0]}
const SECONDARY_BACKGROUND = {backgroundColor: (t: Theme) => toolbarColors[t.palette.mode][1]}

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
  const openSidebar = useCallback(() => setSidebarOpen(true), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  const onConnect = useCallback(() => {
    closeSidebar()
    startWalletConnection()
  }, [startWalletConnection, closeSidebar])

  return (
    <AppBar color="transparent" position="relative">
      <Toolbar sx={MAIN_BACKGROUND}>
        <IconButton onClick={openSidebar} sx={{ display: 'inline-flex' }}>
          <MenuIcon fontSize="small" />
        </IconButton>
        <HeaderLogo appName={currentApp} />

        <Drawer
          anchor="left"
          onClose={closeSidebar}
          open={isSidebarOpen}
          PaperProps={{ sx: { ...SECONDARY_BACKGROUND, ...SIDEBAR_WIDTH, ...HIDE_SCROLLBAR } }}
          variant="temporary"
        >
          <DrawerHeader closeSidebar={closeSidebar} currentApp={currentApp} ChainProps={ChainProps} />

          {/*todo: test header stats*/}
          <HeaderStats appStats={appStats} />

          {Object.entries(groupedPages).map(([title, pages]) => (
            <SidebarSection title={title} key={title} pages={pages} />
          ))}

          <SidebarSection
            title={t.otherApps}
            pages={AppNames.filter((appName) => appName != currentApp).map((appName) => APP_LINK[appName])}
          />

          {sections.map(({ title, links }) => <SidebarSection key={title} title={title} pages={links} />)}

          <SocialSidebarSection title={t.socialMedia} locale={locale} />

          <SideBarFooter
            translations={t}
            LanguageProps={LanguageProps}
            themes={themes}
            advancedMode={advancedMode}
            WalletProps={{ ...WalletProps, onConnectWallet: onConnect }}
            sx={SIDEBAR_WIDTH}
          />
        </Drawer>

      </Toolbar>
    </AppBar>
  )
}

const DrawerHeader = <TChainId extends number>({ ChainProps, currentApp, closeSidebar }: {closeSidebar: () => void, currentApp: AppName, ChainProps: ChainSwitcherProps<TChainId>}) =>(
  <Box
    display="flex"
    flexDirection="row"
    paddingY={2}
    sx={MAIN_BACKGROUND}
  >
    <IconButton onClick={closeSidebar} sx={{ display: 'inline-flex' }}>
      <CloseIcon fontSize="small" />
    </IconButton>
    <HeaderLogo appName={currentApp} />
    <Box flexGrow={1} />
    <ChainSwitcher {...ChainProps} />
  </Box>
)
