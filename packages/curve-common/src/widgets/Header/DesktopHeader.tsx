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

const minHeightSecondary = 40 // todo: add test that height==var(--header-height), primary=56, secondary=40, total=96
const maxWidth = 'var(--width)'

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
    <Toolbar sx={{ backgroundColor: (t: Theme) => toolbarColors[t.palette.mode][0], paddingX: 3, justifyContent: 'space-around' }}>
      <Box display="flex" flexGrow={1} maxWidth={maxWidth}>
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
      </Box>
    </Toolbar>
    <Toolbar sx={{ backgroundColor: (t: Theme) => toolbarColors[t.palette.mode][1], minHeight: minHeightSecondary, justifyContent: 'space-around' }}>
      <Box display="flex" flexGrow={1} maxWidth={maxWidth}>
        <PageTabs pages={pages} minHeight={minHeightSecondary} />
        <Box flexGrow={1} />
        <HeaderStats appStats={appStats} />
      </Box>
    </Toolbar>
  </AppBar>
)
