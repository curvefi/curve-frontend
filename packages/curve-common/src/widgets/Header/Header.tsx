import { AppBar, Toolbar } from '@mui/material'
import Box from '@mui/material/Box'
import type { AppName, AppNavSections, AppPage } from 'ui/src/AppNav/types'
import { ConnectWalletIndicator, ConnectWalletIndicatorProps } from '../../features/connect-wallet'
import { LanguageSwitcher, LanguageSwitcherProps } from '../../features/switch-language'
import { ChainSwitcher, ChainSwitcherProps } from '../../features/switch-chain'
import { AppButtonLinks } from './AppButtonLinks'
import { Dispatch } from 'react'
import { ThemeKey } from 'curve-ui-kit/src/shared/lib'
import { HeaderLogo } from './HeaderLogo'
import { HeaderStats } from './HeaderStats'
import { PageTabs } from './PageTabs'
import { Theme } from '@mui/system'
import { ThemeSwitcher } from '../../features/switch-theme/ThemeSwitcher'

interface HeaderProps<TChainId> {
  currentApp: AppName
  languages: LanguageSwitcherProps
  chains: ChainSwitcherProps<TChainId>
  wallet: ConnectWalletIndicatorProps
  pages: AppPage[]
  themes: [ThemeKey, Dispatch<ThemeKey>]
  appStats: {label: string, value: string}[]
  sections: AppNavSections
  advancedMode: [boolean, Dispatch<boolean>]
  isMdUp: boolean
}

const APP_NAMES = {
  main: "Curve",
  lend: "Llamalend",
  crvusd: "crvUSD",
} as const

// TODO: Color should be in theme
const toolbarColors = {
  light: ['#eeeceb', '#f4f3f0'],
  dark: ['#1f1f1f', '#2f2f2f'], // todo
} as const


export const Header = <TChainId extends number>({ currentApp, chains, languages, wallet, pages, appStats, themes: [theme, setTheme], sections, advancedMode: [isAdvancedMode, setAdvancedMode], isMdUp }: HeaderProps<TChainId>) => {
  return (
    <AppBar color="transparent" position={"relative"}>
      <Toolbar sx={{ backgroundColor: (t: Theme) => toolbarColors[t.palette.mode][0] }}>
        {/*{*/}
        {/*  !isMdUp && (*/}
        {/*    <IconButton*/}
        {/*      onClick={onOpenSidebar}*/}
        {/*      sx={{*/}
        {/*        display: {*/}
        {/*          xs: 'inline-flex',*/}
        {/*          lg: 'none',*/}
        {/*        },*/}
        {/*      }}*/}
        {/*      data-testid={createTestId('dashboard-menu-trigger')}*/}
        {/*    >*/}
        {/*      <MenuIcon fontSize="small" />*/}
        {/*    </IconButton>*/}
        {/*}*/}
        <HeaderLogo appName={APP_NAMES[currentApp]} />
        {isMdUp && <AppButtonLinks currentApp="lend" />}

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ marginLeft: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <ThemeSwitcher theme={theme} onChange={setTheme} />
          <LanguageSwitcher {...languages} />
          <ChainSwitcher {...chains} />
          <ConnectWalletIndicator {...wallet} />
        </Box>
      </Toolbar>
      <Toolbar sx={{ backgroundColor: (t: Theme) => toolbarColors[t.palette.mode][1] }}>
        <PageTabs pages={pages} />
        <Box flexGrow={1} />
        <HeaderStats appStats={appStats} />
      </Toolbar>
    </AppBar>
  );
};
