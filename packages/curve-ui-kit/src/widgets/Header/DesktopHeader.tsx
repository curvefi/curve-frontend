import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import { ConnectWalletIndicator } from '@ui-kit/features/connect-wallet'
import { ChainSwitcher } from '@ui-kit/features/switch-chain'
import { UserProfile } from '@ui-kit/features/user-profile'
import { GlobalBanner } from '@ui-kit/shared/ui/GlobalBanner'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { AppButtonLinks } from './AppButtonLinks'
import { HeaderLogo } from './HeaderLogo'
import { HeaderStats } from './HeaderStats'
import { PageTabsSwitcher } from './PageTabsSwitcher'
import { SubNav } from './SubNav'
import { HeaderImplementationProps } from './types'
import { useMainNavRef } from './useMainNavRef'

const { Spacing } = SizesAndSpaces

export const DesktopHeader = ({
  currentMenu,
  chainId,
  supportedNetworks,
  pages,
  appStats,
  networkId,
}: HeaderImplementationProps) => (
  <AppBar
    color="transparent"
    ref={useMainNavRef()}
    data-testid="desktop-main-nav"
    sx={{ position: 'sticky', top: 0, boxShadow: 'none' }}
  >
    <GlobalBanner networkId={networkId} chainId={chainId} />

    <Toolbar
      sx={{
        backgroundColor: (t) => t.design.Layer[2].Fill,
        justifyContent: 'space-around',
        paddingY: 0,
        borderBottom: (t) => `1px solid ${t.design.Layer[2].Outline}`,
      }}
      data-testid="main-nav"
    >
      <Container sx={{ paddingInline: Spacing.md }}>
        <HeaderLogo sx={{ paddingInlineStart: Spacing.md }} />
        <AppButtonLinks networkId={networkId} currentMenu={currentMenu} />

        <Box sx={{ flexGrow: 1 }} />

        <Box display="flex" marginLeft={2} justifyContent="flex-end" gap={3} alignItems="center">
          <UserProfile />
          <ChainSwitcher networks={supportedNetworks} />
          <ConnectWalletIndicator />
        </Box>
      </Container>
    </Toolbar>

    {pages.length > 0 && (
      <SubNav testId="subnav">
        <PageTabsSwitcher pages={pages} />
        <Box flexGrow={1} />
        <Box display="flex" gap={3} alignItems="baseline" sx={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
          <HeaderStats appStats={appStats} />
        </Box>
      </SubNav>
    )}
  </AppBar>
)
