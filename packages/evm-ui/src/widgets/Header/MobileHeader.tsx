import { useEffect, useMemo } from 'react'
import { usePathname } from '@evm-ui/hooks/router'
import { GlobalBanner } from '@evm-ui/shared/ui/GlobalBanner'
import AppBar from '@mui/material/AppBar'
import Drawer from '@mui/material/Drawer'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import { recordEntries } from '@primitives/objects.utils'
import { useLayoutStore } from '@ui/features/layout/layout'
import { MOBILE_SIDEBAR_WIDTH } from '@ui/features/themes/components'
import { useSwitch } from '@ui/hooks/useSwitch'
import { t } from '@ui/lib/i18n'
import { HeaderStats } from './HeaderStats'
import { MobileTopBar } from './MobileTopBar'
import { SideBarFooter } from './SideBarFooter'
import { SidebarSection } from './SidebarSection'
import { SocialSidebarSection } from './SocialSidebarSection'
import { HeaderProps } from './types'
import { useMainNavRef } from './useMainNavRef'
import { getHeaderBorder } from './utils'

const HIDE_SCROLLBAR = {
  // hide the scrollbar, on mobile it's not needed, and it messes up with the SideBarFooter
  '&::-webkit-scrollbar': { display: 'none' }, // chrome, safari, opera
  msOverflowStyle: 'none', // IE and Edge
  scrollbarWidth: 'none', // Firefox
}

const PADDING_BLOCK = 3

export const MobileHeader = <TMenuApp extends string, TId extends string, TChainId extends number>({
  currentMenu,
  pages,
  appStats,
  sections,
  backendMaintenance,
  supportedNetworks,
  tvls,
  hideChains,
  links,
  currentNetwork,
  connectWalletProps,
}: HeaderProps<TMenuApp, TId, TChainId>) => {
  const [isSidebarOpen, , closeSidebar, toggleSidebar] = useSwitch(false)
  const pathname = usePathname()
  const top = useLayoutStore(state => state.navHeight)
  const { blockchainId, chainId } = currentNetwork

  useEffect(() => () => closeSidebar(), [pathname, closeSidebar]) // close when URL changes due to clicking a link

  const otherAppSections = useMemo(
    () =>
      recordEntries(links)
        .filter(([appName]) => appName != currentMenu)
        .map(([appName, { label, pages }]) => ({
          appName,
          title: label,
          pages,
        })),
    [currentMenu, links],
  )
  return (
    <AppBar
      color="transparent"
      ref={useMainNavRef()}
      sx={{
        backgroundColor: t => t.design.Layer[1].Fill,
        position: 'sticky',
        top: 0,
        boxShadow: 'none',
        borderBottom: getHeaderBorder,
      }}
      data-testid="mobile-main-bar"
    >
      <GlobalBanner blockchainId={blockchainId} chainId={chainId} backendMaintenance={backendMaintenance} />
      <Toolbar sx={t => ({ paddingBlock: PADDING_BLOCK, zIndex: t.zIndex.drawer + 1 })}>
        <MobileTopBar
          supportedNetworks={supportedNetworks}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          currentMenu={currentMenu}
          currentNetwork={currentNetwork}
          hideChains={hideChains}
          tvls={tvls}
        />

        <Drawer
          anchor="left"
          onClose={closeSidebar}
          open={isSidebarOpen}
          slotProps={{
            paper: {
              sx: {
                top,
                ...MOBILE_SIDEBAR_WIDTH,
                ...HIDE_SCROLLBAR,
                height: `calc(100dvh - ${top}px)`,
              },
            },
          }}
          sx={{ top }}
          variant="temporary"
          hideBackdrop
          data-testid="mobile-drawer"
        >
          <Stack sx={{ overflowY: 'auto', ...HIDE_SCROLLBAR }}>
            <Stack sx={{ padding: 4 }}>
              <HeaderStats appStats={appStats} />
            </Stack>

            <SidebarSection title={links[currentMenu].label} pages={pages} />

            {otherAppSections.map(({ appName, ...props }) => (
              <SidebarSection key={appName} {...props} />
            ))}

            {sections.map(({ title, links }) => (
              <SidebarSection key={title} title={title} pages={links} />
            ))}

            <SocialSidebarSection title={t`Community`} />
          </Stack>

          <SideBarFooter onConnect={closeSidebar} connectWalletProps={connectWalletProps} />
        </Drawer>
      </Toolbar>
    </AppBar>
  )
}
