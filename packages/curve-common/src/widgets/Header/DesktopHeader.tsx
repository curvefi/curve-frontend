import { AppBar, Toolbar } from '@mui/material'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { ConnectWalletIndicator } from '../../features/connect-wallet'
import { ChainSwitcher } from '../../features/switch-chain'
import { AppButtonLinks } from './AppButtonLinks'
import { HeaderLogo } from './HeaderLogo'
import { HeaderStats } from './HeaderStats'
import { PageTabs } from './PageTabs'
import { ThemeSwitcherButton } from '../../features/switch-theme'
import { AdvancedModeSwitcher } from '../../features/switch-advanced-mode'
import { BaseHeaderProps } from './types'
import { DEFAULT_BAR_SIZE } from 'curve-ui-kit/src/themes/components'

export const DesktopHeader = <TChainId extends number>({
  mainNavRef,
  currentApp,
  ChainProps,
  WalletProps,
  pages,
  appStats,
  themes: [theme, setTheme],
  advancedMode,
  isLite = false,
  translations: t,
}: BaseHeaderProps<TChainId>) => (
  <>
    <AppBar color="transparent" ref={mainNavRef}>
      <Toolbar
        sx={{ backgroundColor: 'background.paper', justifyContent: 'space-around', paddingY: 3 }}
        data-testid="main-nav"
      >
        <Container>
          <HeaderLogo isLite={isLite} appName={currentApp} />
          <AppButtonLinks currentApp={currentApp} />

          <Box sx={{ flexGrow: 1 }} />

          <Box display="flex" marginLeft={2} justifyContent="flex-end" gap={3} alignItems="center">
            {advancedMode && <AdvancedModeSwitcher advancedMode={advancedMode} label={t.advanced} />}
            <ThemeSwitcherButton theme={theme} onChange={setTheme} label={t.theme} />
            <ChainSwitcher {...ChainProps} />
            <ConnectWalletIndicator {...WalletProps} />
          </Box>
        </Container>
      </Toolbar>
      <Toolbar
        sx={{
          backgroundColor: 'background.layer1Fill',
          justifyContent: 'space-around',
          borderWidth: '1px 0',
          borderColor: 'background.layer1Outline',
          borderStyle: 'solid',
          boxSizing: 'content-box',
          height: DEFAULT_BAR_SIZE,
        }}
        data-testid="subnav"
      >
        <Container>
          <PageTabs pages={pages} />
          <Box flexGrow={1} />
          <Box display="flex" gap={3} alignItems="center">
            <HeaderStats appStats={appStats} />
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
    <Box height={96} />
  </>
)
