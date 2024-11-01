import { AppBar, Toolbar } from '@mui/material'
import { Theme } from '@mui/system'
import { BaseHeaderProps, toolbarColors } from './types'
import IconButton from '@mui/material/IconButton'
import React, { useCallback, useMemo, useState } from 'react'
import Drawer from '@mui/material/Drawer'
import { SidebarSection } from './SidebarSection'
import groupBy from 'lodash/groupBy'
import { useLocation } from 'react-router'
import Box from '@mui/material/Box'
import { ThemeSwitcherButton } from '../../features/switch-theme'
import { LanguageSwitcher } from '../../features/switch-language'
import { ChainSwitcher } from '../../features/switch-chain'
import { ConnectWalletIndicator } from '../../features/connect-wallet'
import { APP_LINK } from 'ui'
import { AppNames } from 'ui/src/AppNav/types'
import CloseIcon from '@mui/icons-material/Close'
import { HeaderStats } from './HeaderStats'
import { HeaderLogoWithMenu } from './HeaderLogoWithMenu'
import { SocialSidebarSection } from './SocialSidebarSection'

const width = {width: '80%', minWidth: 320, maxWidth: 400} as const

export const MobileHeader = <TChainId extends number>({
  currentApp,
  chains,
  languages,
  wallet,
  pages,
  appStats,
  themes: [theme, setTheme],
  sections,
  locale,
  translations: t,
}: BaseHeaderProps<TChainId>) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const groupedPages = useMemo(() => groupBy(pages, (p) => p.groupedTitle), [pages])
  const { pathname: currentPath } = useLocation()

  const openSidebar = useCallback(() => setSidebarOpen(true), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
  const onConnectWallet = wallet.onConnectWallet
  const onConnect = useCallback(() => {
    closeSidebar()
    onConnectWallet()
  }, [onConnectWallet, closeSidebar])

  return (
    <AppBar color="transparent" position="relative">
      <Toolbar sx={{ backgroundColor: (t: Theme) => toolbarColors[t.palette.mode][0] }}>
        <HeaderLogoWithMenu onClick={openSidebar} appName={currentApp} />

        <Drawer
          anchor="left"
          onClose={closeSidebar}
          open={isSidebarOpen}
          PaperProps={{
            sx: {
              backgroundColor: (t: Theme) => toolbarColors[t.palette.mode][1],
              ...width,
              '&::-webkit-scrollbar': { display: 'none' }, // chrome, safari, opera
              msOverflowStyle: 'none', // IE and Edge
              scrollbarWidth: 'none', // Firefox
            }
          }}
          variant="temporary"
        >
          <Box display="flex" flexDirection="row" marginTop={2} sx={{ backgroundColor: (t: Theme) => toolbarColors[t.palette.mode][0] }}>
            <HeaderLogoWithMenu onClick={closeSidebar} appName={currentApp} />
            <Box flexGrow={1} />
            <ChainSwitcher {...chains} />
            <IconButton onClick={closeSidebar} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <HeaderStats appStats={appStats} />

          {Object.entries(groupedPages).map(([title, pages]) => (
            <SidebarSection title={title} key={title} pages={pages} currentPath={currentPath} />
          ))}

          <SidebarSection
            title={t.otherApps}
            pages={AppNames.filter((appName) => appName != currentApp).map((appName) => APP_LINK[appName])}
            currentPath={currentPath}
          />

          {sections.map(({ title, links }) => <SidebarSection key={title} title={title} pages={links} currentPath={currentPath} />)}

          <SocialSidebarSection currentPath={currentPath} title={t.socialMedia} locale={locale} />

          <SidebarSection title={t.options} currentPath={currentPath}>
            <Box display="flex" flexDirection="column" marginLeft={2} justifyContent="flex-end" gap={3} flexGrow={1}>
              <LanguageSwitcher {...languages} />
              <ThemeSwitcherButton theme={theme} onChange={setTheme} label={t.themeSwitcher} />
            </Box>
          </SidebarSection>

          <Box display="flex" position="fixed" bottom={0} paddingX={4} sx={{ ...width, zIndex: 1300 }}>
            <ConnectWalletIndicator {...wallet} onConnectWallet={onConnect} sx={{ flexGrow: 1 }} />
          </Box>
          <Box minHeight={40} /> {/* To avoid the last item to be hidden by the connect indicator */}
        </Drawer>

      </Toolbar>
    </AppBar>
  )
}
