import { ConnectWalletIndicator } from '@evm-ui/features/connect-wallet'
import { ChainSwitcher } from '@evm-ui/features/switch-chain'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { UserProfile } from '@ui/features/user-profile'
import { AppButtonLinks } from './AppButtonLinks'
import { HeaderLogo } from './HeaderLogo'
import { HeaderStats } from './HeaderStats'
import { PageTabsSwitcher } from './PageTabsSwitcher'
import { SubNav } from './SubNav'
import { HeaderProps } from './types'
import { useMainNavRef } from './useMainNavRef'
import { getHeaderBorder } from './utils'

const { Spacing } = SizesAndSpaces

export const DesktopHeader = <TApp extends string>({
  currentMenu,
  currentNetwork,
  supportedNetworks,
  pages,
  appStats,
  hideChains,
  tvls,
  links,
  banners,
  connectWalletProps,
}: HeaderProps<TApp>) => (
  <AppBar
    color="transparent"
    ref={useMainNavRef()}
    data-testid="desktop-main-nav"
    sx={{ position: 'sticky', top: 0, boxShadow: 'none', borderBottom: getHeaderBorder }}
  >
    {banners}

    <Toolbar
      sx={{ backgroundColor: t => t.design.Layer[2].Fill, justifyContent: 'space-around', paddingY: 0 }}
      data-testid="main-nav"
    >
      <Container sx={{ paddingInline: Spacing.md }}>
        <HeaderLogo sx={{ paddingInlineStart: Spacing.md }} />
        <AppButtonLinks currentMenu={currentMenu} links={links} />

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', marginLeft: 2, justifyContent: 'flex-end', gap: 3, alignItems: 'center' }}>
          <UserProfile {...connectWalletProps} />
          <ChainSwitcher
            supportedNetworks={supportedNetworks}
            currentNetwork={currentNetwork}
            currentMenu={currentMenu}
            hideChains={hideChains}
            tvls={tvls}
          />
          <ConnectWalletIndicator {...connectWalletProps} />
        </Box>
      </Container>
    </Toolbar>

    {pages.length > 0 && (
      <SubNav testId="subnav">
        <PageTabsSwitcher pages={pages} />
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'baseline', textOverflow: 'ellipsis', overflow: 'hidden' }}>
          <HeaderStats appStats={appStats} />
        </Box>
      </SubNav>
    )}
  </AppBar>
)
