import { AppBar, Toolbar } from '@mui/material'
import { HeaderLogo } from './HeaderLogo'
import { Theme } from '@mui/system'
import { BaseHeaderProps, toolbarColors } from './types'
import IconButton from '@mui/material/IconButton'
import React, { useCallback, useMemo, useState } from 'react'
import { MenuIcon } from 'curve-ui-kit/src/shared/ui/MenuIcon'
import Drawer from '@mui/material/Drawer'
import { SidebarSection } from './SidebarSection'
import groupBy from 'lodash/groupBy'
import { useLocation } from 'react-router'
import Box from '@mui/material/Box'
import { AdvancedModeSwitcher } from '../../features/switch-advanced-mode'
import { ThemeSwitcherButton } from '../../features/switch-theme'
import { LanguageSwitcher } from '../../features/switch-language'
import { ChainSwitcher } from '../../features/switch-chain'
import { ConnectWalletIndicator } from '../../features/connect-wallet'
import { APP_LINK } from 'ui'
import { AppName, AppNames } from 'ui/src/AppNav/types'
import { CloseIcon } from 'curve-ui-kit/src/shared/ui/CloseIcon'
import { t } from '@lingui/macro'
import { HeaderStats } from './HeaderStats'

const HeaderLogoWithMenu = (props: { onClick: () => void, appName: AppName }) => (
  <>
    <IconButton onClick={props.onClick} sx={{ display: 'inline-flex' }}>
      <MenuIcon fontSize="small" />
    </IconButton>
    <HeaderLogo appName={props.appName} />
  </>
)


export const MobileHeader = <TChainId extends number>({
                                                        currentApp,
                                                        chains,
                                                        languages,
                                                        wallet,
                                                        pages,
                                                        appStats,
                                                        themes: [theme, setTheme],
                                                        sections,
                                                        advancedMode: [isAdvancedMode, setAdvancedMode]
                                                      }: BaseHeaderProps<TChainId>) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const groupedPages = useMemo(() => groupBy(pages, (p) => p.groupedTitle), [pages])
  const { pathname: currentPath } = useLocation()

  const openSidebar = useCallback(() => setSidebarOpen(true), [])
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])
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
              width: '80%',
              maxWidth: 400
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
            title={t`Other Apps`}
            pages={AppNames.filter((appName) => appName != currentApp).map((appName) => APP_LINK[appName])}
            currentPath={currentPath}
          />

          {/* TODO: <SidebarSection title={t`Socials`} currentPath={currentPath} />*/}

          <SidebarSection title={t`Options`} currentPath={currentPath}>
            <Box display="flex" flexDirection="column" marginLeft={2} justifyContent="flex-end" gap={3}>
              <AdvancedModeSwitcher advancedMode={isAdvancedMode} onChange={setAdvancedMode} />
              <LanguageSwitcher {...languages} />
              <ThemeSwitcherButton theme={theme} onChange={setTheme} />
              <ConnectWalletIndicator {...wallet} />
            </Box>
          </SidebarSection>
        </Drawer>

      </Toolbar>
    </AppBar>
  )
}
