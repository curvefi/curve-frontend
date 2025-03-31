import { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import { ConnectWalletIndicator } from '@ui-kit/features/connect-wallet'
import { AdvancedModeSwitcher } from '@ui-kit/features/switch-advanced-mode'
import { ChainSwitcher } from '@ui-kit/features/switch-chain'
import { ThemeSwitcherButton } from '@ui-kit/features/switch-theme'
import { UserProfileButton, useUserProfileStore } from '@ui-kit/features/user-profile'
import { useBetaFlag } from '@ui-kit/hooks/useBetaFlag'
import { t } from '@ui-kit/lib/i18n'
import { type AppMenuOption } from '@ui-kit/shared/routes'
import { GlobalBanner } from '@ui-kit/shared/ui/GlobalBanner'
import { DEFAULT_BAR_SIZE } from '@ui-kit/themes/components'
import { isCypress } from '@ui-kit/utils'
import { AppButtonLinks } from './AppButtonLinks'
import { HeaderLogo } from './HeaderLogo'
import { HeaderStats } from './HeaderStats'
import { PageTabs } from './PageTabs'
import { HeaderImplementationProps } from './types'

export const DESKTOP_HEADER_HEIGHT = '96px' // note: hardcoded height is tested in cypress

export const DesktopHeader = <TChainId extends number>({
  mainNavRef,
  currentMenu,
  ChainProps,
  WalletProps,
  BannerProps,
  height, // height above + banner height
  pages,
  appStats,
  networkName,
  isLite = false,
}: HeaderImplementationProps<TChainId>) => {
  const [menu, setMenu] = useState<AppMenuOption>(currentMenu)
  const theme = useUserProfileStore((state) => state.theme)
  const setTheme = useUserProfileStore((state) => state.setTheme)
  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)
  const setAdvancedMode = useUserProfileStore((state) => state.setAdvancedMode)
  const [isBeta] = useBetaFlag()

  return (
    <>
      <AppBar color="transparent" ref={mainNavRef}>
        <GlobalBanner {...BannerProps} />

        <Toolbar
          sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, justifyContent: 'space-around', paddingY: 3 }}
          data-testid="main-nav"
        >
          <Container>
            <HeaderLogo isLite={isLite} currentMenu={currentMenu} />
            <AppButtonLinks currentMenu={menu} onChange={setMenu} networkName={networkName} />

            <Box sx={{ flexGrow: 1 }} />

            <Box display="flex" marginLeft={2} justifyContent="flex-end" gap={3} alignItems="center">
              {isBeta && !isCypress ? (
                <UserProfileButton />
              ) : (
                <>
                  <AdvancedModeSwitcher advancedMode={[isAdvancedMode, setAdvancedMode]} label={t`Advanced`} />
                  <ThemeSwitcherButton theme={theme} onChange={setTheme} label={t`Mode`} />
                </>
              )}

              <ChainSwitcher {...ChainProps} headerHeight={height} />
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
            <PageTabs pages={pages} />
            <Box flexGrow={1} />
            <Box display="flex" gap={3} alignItems="center" sx={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
              <HeaderStats appStats={appStats} />
            </Box>
          </Container>
        </Toolbar>
      </AppBar>
      {/* create an empty box to take the place behind the header */}
      <Box height={height} />
    </>
  )
}
