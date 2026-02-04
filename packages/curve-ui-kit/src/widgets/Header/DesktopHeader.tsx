import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import { ConnectWalletIndicator } from '@ui-kit/features/connect-wallet'
import { ChainSwitcher } from '@ui-kit/features/switch-chain'
import { UserProfile } from '@ui-kit/features/user-profile'
import { GlobalBanner } from '@ui-kit/shared/ui/GlobalBanner'
import { DEFAULT_BAR_SIZE } from '@ui-kit/themes/components'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { AppButtonLinks } from './AppButtonLinks'
import { HeaderLogo } from './HeaderLogo'
import { HeaderStats } from './HeaderStats'
import { PageTabs } from './PageTabs'
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
  isLite = false,
}: HeaderImplementationProps) => (
  <AppBar color="transparent" ref={useMainNavRef()} data-testid="desktop-main-nav" sx={{ position: 'sticky', top: 0 }}>
    <GlobalBanner networkId={networkId} chainId={chainId} />

    <Toolbar
      sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, justifyContent: 'space-around', paddingY: 0 }}
      data-testid="main-nav"
    >
      <Container sx={{ paddingX: Spacing.md }}>
        <HeaderLogo />
        <AppButtonLinks networkId={networkId} currentMenu={currentMenu} />

        <Box sx={{ flexGrow: 1 }} />

        <Box display="flex" marginLeft={2} justifyContent="flex-end" gap={3} alignItems="center">
          <UserProfile />
          <ChainSwitcher networks={supportedNetworks} />
          <ConnectWalletIndicator />
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
      <Container sx={{ paddingX: Spacing.md }}>
        <PageTabs pages={pages} />
        <Box flexGrow={1} />
        <Box display="flex" gap={3} alignItems="center" sx={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
          <HeaderStats appStats={appStats} />
        </Box>
      </Container>
    </Toolbar>
  </AppBar>
)
