import { ConnectWalletIndicator } from '@evm-ui/features/connect-wallet'
import { ChainSwitcher } from '@evm-ui/features/switch-chain'
import { UserProfile } from '@evm-ui/features/user-profile'
import { GlobalBanner } from '@evm-ui/shared/ui/GlobalBanner'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import { AppButtonLinks } from './AppButtonLinks'
import { HeaderLogo } from './HeaderLogo'
import { HeaderStats } from './HeaderStats'
import { PageTabsSwitcher } from './PageTabsSwitcher'
import { SubNav } from './SubNav'
import { HeaderImplementationProps } from './types'
import { useMainNavRef } from './useMainNavRef'
import { getHeaderBorder } from './utils'

const { Spacing } = SizesAndSpaces

export const DesktopHeader = ({
  currentMenu,
  chainId,
  backendMaintenance,
  supportedNetworks,
  pages,
  appStats,
  blockchainId,
}: HeaderImplementationProps) => (
  <AppBar
    color="transparent"
    ref={useMainNavRef()}
    data-testid="desktop-main-nav"
    sx={{ position: 'sticky', top: 0, boxShadow: 'none', borderBottom: getHeaderBorder }}
  >
    <GlobalBanner blockchainId={blockchainId} chainId={chainId} backendMaintenance={backendMaintenance} />

    <Toolbar
      sx={{ backgroundColor: t => t.design.Layer[2].Fill, justifyContent: 'space-around', paddingY: 0 }}
      data-testid="main-nav"
    >
      <Container sx={{ paddingInline: Spacing.md }}>
        <HeaderLogo sx={{ paddingInlineStart: Spacing.md }} />
        <AppButtonLinks blockchainId={blockchainId} currentMenu={currentMenu} />

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ display: 'flex', marginLeft: 2, justifyContent: 'flex-end', gap: 3, alignItems: 'center' }}>
          <UserProfile />
          <ChainSwitcher supportedNetworks={supportedNetworks} currentMenu={currentMenu} />
          <ConnectWalletIndicator />
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
