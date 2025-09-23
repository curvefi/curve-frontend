import { useState } from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Toolbar from '@mui/material/Toolbar'
import { ConnectWalletIndicator } from '@ui-kit/features/connect-wallet'
import { ChainSwitcher } from '@ui-kit/features/switch-chain'
import { UserProfileButton } from '@ui-kit/features/user-profile'
import { useReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import { type AppMenuOption } from '@ui-kit/shared/routes'
import { GlobalBanner } from '@ui-kit/shared/ui/GlobalBanner'
import { DEFAULT_BAR_SIZE } from '@ui-kit/themes/components'
import { isCypress, ReleaseChannel } from '@ui-kit/utils'
import { AppButtonLinks } from './AppButtonLinks'
import { HeaderLogo } from './HeaderLogo'
import { HeaderStats } from './HeaderStats'
import { PageTabs } from './PageTabs'
import { HeaderImplementationProps } from './types'
import { useMainNavRef } from './useMainNavRef'

export const DesktopHeader = ({
  currentMenu,
  chainId,
  supportedNetworks,
  pages,
  appStats,
  networkId,
  isLite = false,
}: HeaderImplementationProps) => {
  const [menu, setMenu] = useState<AppMenuOption>(currentMenu)
  const [releaseChannel] = useReleaseChannel()
  return (
    <AppBar
      color="transparent"
      ref={useMainNavRef()}
      data-testid="desktop-main-nav"
      sx={{ position: 'sticky', top: 0 }}
    >
      <GlobalBanner networkId={networkId} chainId={chainId} />

      <Toolbar
        sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, justifyContent: 'space-around', paddingY: 3 }}
        data-testid="main-nav"
      >
        <Container>
          <HeaderLogo isLite={isLite} currentMenu={currentMenu} />
          <AppButtonLinks currentMenu={menu} onChange={setMenu} networkId={networkId} />

          <Box sx={{ flexGrow: 1 }} />

          <Box display="flex" marginLeft={2} justifyContent="flex-end" gap={3} alignItems="center">
            {/* TODO: update cypress tests to support UserProfileButton */}
            <UserProfileButton visible={releaseChannel !== ReleaseChannel.Legacy && !isCypress} />
            <ChainSwitcher chainId={chainId} networks={supportedNetworks} />
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
        <Container>
          <PageTabs pages={pages} />
          <Box flexGrow={1} />
          <Box display="flex" gap={3} alignItems="center" sx={{ textOverflow: 'ellipsis', overflow: 'hidden' }}>
            <HeaderStats appStats={appStats} />
          </Box>
        </Container>
      </Toolbar>
    </AppBar>
  )
}
