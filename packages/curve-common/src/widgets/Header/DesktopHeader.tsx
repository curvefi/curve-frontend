import { AppBar, Toolbar } from '@mui/material'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { ConnectWalletIndicator } from 'curve-ui-kit/src/features/connect-wallet'
import { ChainSwitcher } from 'curve-ui-kit/src/features/switch-chain'
import { AppButtonLinks } from './AppButtonLinks'
import { HeaderLogo } from './HeaderLogo'
import { HeaderStats } from './HeaderStats'
import { PageTabs } from './PageTabs'
import { ThemeSwitcherButton } from 'curve-ui-kit/src/features/switch-theme'
import { AdvancedModeSwitcher } from 'curve-ui-kit/src/features/switch-advanced-mode'
import { BaseHeaderProps } from './types'
import { DEFAULT_BAR_SIZE } from 'curve-ui-kit/src/themes/components'
import { useState } from 'react'
import { AppName } from 'curve-ui-kit/src/shared/routes'
import { t } from '@lingui/macro'
import GlobalBanner from 'ui/src/Banner'

export const DesktopHeader = <TChainId extends number>({
  mainNavRef,
  currentApp,
  ChainProps,
  WalletProps,
  BannerProps,
  bannerHeight = 0,
  pages,
  appStats,
  themes: [theme, setTheme],
  advancedMode,
  networkName,
  isLite = false,
}: BaseHeaderProps<TChainId>) => {
  const [selectedApp, setSelectedApp] = useState<AppName>(currentApp)
  return (
    <>
      <AppBar color="transparent" ref={mainNavRef}>
        <GlobalBanner {...BannerProps} />

        <Toolbar
          sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, justifyContent: 'space-around', paddingY: 3 }}
          data-testid="main-nav"
        >
          <Container>
            <HeaderLogo isLite={isLite} appName={currentApp} />
            <AppButtonLinks selectedApp={selectedApp} onChange={setSelectedApp} networkName={networkName} />

            <Box sx={{ flexGrow: 1 }} />

            <Box display="flex" marginLeft={2} justifyContent="flex-end" gap={3} alignItems="center">
              {advancedMode && <AdvancedModeSwitcher advancedMode={advancedMode} label={t`Advanced`} />}
              <ThemeSwitcherButton theme={theme} onChange={setTheme} label={t`Mode`} />
              <ChainSwitcher {...ChainProps} />
              <ConnectWalletIndicator {...WalletProps} />
            </Box>
          </Container>
        </Toolbar>
        <Toolbar
          sx={{
            backgroundColor: (t) => t.design.Layer[2].Fill,
            justifyContent: 'space-around',
            borderWidth: '1px 0',
            borderColor: (t) => t.design.Layer[2].Outline,
            borderStyle: 'solid',
            boxSizing: 'content-box',
            height: DEFAULT_BAR_SIZE,
          }}
          data-testid="subnav"
        >
          <Container>
            <PageTabs pages={pages} currentApp={currentApp} selectedApp={selectedApp} networkName={networkName} />
            <Box flexGrow={1} />
            <Box display="flex" gap={3} alignItems="center">
              <HeaderStats appStats={appStats} />
            </Box>
          </Container>
        </Toolbar>
      </AppBar>
      {/* Hardcoded height is tested in header.cy.ts - it creates an empty box to take the place behind the header */}
      <Box height={96 + bannerHeight} />
    </>
  )
}
