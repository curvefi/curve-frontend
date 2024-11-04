import { AppBar, Toolbar } from '@mui/material'
import Box from '@mui/material/Box'
import { ConnectWalletIndicator } from '../../features/connect-wallet'
import { LanguageSwitcher } from '../../features/switch-language'
import { ChainSwitcher } from '../../features/switch-chain'
import { AppButtonLinks } from './AppButtonLinks'
import { HeaderLogo } from './HeaderLogo'
import { HeaderStats } from './HeaderStats'
import { PageTabs } from './PageTabs'
import { Theme } from '@mui/system'
import { ThemeSwitcherButton } from '../../features/switch-theme'
import { AdvancedModeSwitcher } from '../../features/switch-advanced-mode'
import { BaseHeaderProps, toolbarColors } from './types'

export const DesktopHeader = <TChainId extends number>({
  currentApp,
  ChainProps,
  LanguageProps,
  WalletProps,
  pages,
  appStats,
  themes: [theme, setTheme],
  advancedMode: [isAdvancedMode, setAdvancedMode],
  translations: t
}: BaseHeaderProps<TChainId>) => (
  <AppBar color="transparent" position="relative">
    <Toolbar sx={{ backgroundColor: (t: Theme) => toolbarColors[t.palette.mode][0] }}>
      <HeaderLogo appName={currentApp} />
      <AppButtonLinks currentApp="lend" />

      <Box sx={{ flexGrow: 1 }} />

      <Box display="flex" marginLeft={2} justifyContent="flex-end" gap={3} alignItems="center">
        <AdvancedModeSwitcher advancedMode={isAdvancedMode} onChange={setAdvancedMode} label={t.advanced} />
        <LanguageSwitcher {...LanguageProps} />
        <ThemeSwitcherButton theme={theme} onChange={setTheme} label={t.theme} />
        <ChainSwitcher {...ChainProps} />
        <ConnectWalletIndicator {...WalletProps} />
      </Box>
    </Toolbar>
    <Toolbar sx={{ backgroundColor: (t: Theme) => toolbarColors[t.palette.mode][1] }}>
      <PageTabs pages={pages} />
      <Box flexGrow={1} />
      <HeaderStats appStats={appStats} />
    </Toolbar>
  </AppBar>
)
