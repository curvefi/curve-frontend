import { AppName } from './types'
import { ChainSwitcher, ChainSwitcherProps } from '../../features/switch-chain'
import Box from '@mui/material/Box'
import { MenuToggleButton } from './MenuToggleButton'
import { HeaderLogo } from './HeaderLogo'
import React from 'react'
import type { Theme, SxProps } from '@mui/system'


export type MobileTopBarProps<TChainId extends number> = {
  toggleSidebar: () => void,
  isSidebarOpen: boolean,
  isLite: boolean,
  currentApp: AppName,
  ChainProps: ChainSwitcherProps<TChainId>
  sx: SxProps<Theme>
}

export const MobileTopBar = <TChainId extends number>({ ChainProps, currentApp, isSidebarOpen, toggleSidebar, isLite, sx }: MobileTopBarProps<TChainId>) => (
  <Box
    display="flex"
    flexDirection="row"
    flexGrow={1}
    paddingX={2}
    sx={sx}
  >
    <MenuToggleButton isOpen={isSidebarOpen} toggle={toggleSidebar} />
    <HeaderLogo isLite={isLite} appName={currentApp} />
    <Box flexGrow={1} />
    <ChainSwitcher {...ChainProps} />
  </Box>
)
