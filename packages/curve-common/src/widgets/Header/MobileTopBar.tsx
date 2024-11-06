import { AppName } from 'ui/src/AppNav/types'
import { ChainSwitcher, ChainSwitcherProps } from '../../features/switch-chain'
import Box from '@mui/material/Box'
import { MenuToggleButton } from './MenuToggleButton'
import { HeaderLogo } from './HeaderLogo'
import React from 'react'
import type { Theme, SxProps } from '@mui/system'


export type MobileTopBarProps<TChainId extends number> = {
  toggleSidebar: () => void,
  isSidebarOpen: boolean,
  currentApp: AppName,
  ChainProps: ChainSwitcherProps<TChainId>
  sx: SxProps<Theme>
  zIndex?: number
}

export const MobileTopBar = <TChainId extends number>({ ChainProps, currentApp, isSidebarOpen, toggleSidebar, sx, zIndex }: MobileTopBarProps<TChainId>) => (
  <Box
    display="flex"
    flexDirection="row"
    flexGrow={1}
    paddingX={2}
    sx={{
      ...sx,
      transition: zIndex && !isSidebarOpen ? 'opacity 0s' : 'opacity 1s', // smooth transition when opening the sidebar
      transitionDelay: !zIndex || isSidebarOpen ? '1s' : '0', // delay the transition when opening the sidebar
      ...zIndex && { zIndex },

      // this component is rendered in the header and in the drawer. The header has zIndex to display the toggle animation.
      // hide the header one when the sidebar is open, so it's not displayed during scroll
      // hide the drawer one when the sidebar is closed, so it's not displayed during the open animation
      opacity: isSidebarOpen == Boolean(zIndex) ? 0 : 1,
    }}
  >
    <MenuToggleButton isOpen={isSidebarOpen} toggle={toggleSidebar} />
    <HeaderLogo appName={currentApp} />
    <Box flexGrow={1} />
    <ChainSwitcher {...ChainProps} />
  </Box>
)
