import { ChainSwitcher, ChainSwitcherProps } from '../../features/switch-chain'
import Box from '@mui/material/Box'
import { MenuToggleButton } from './MenuToggleButton'
import { HeaderLogo } from './HeaderLogo'
import React from 'react'
import { AppName } from 'curve-ui-kit/src/shared/routes'

export type MobileTopBarProps<TChainId extends number> = {
  toggleSidebar: () => void
  isSidebarOpen: boolean
  isLite: boolean
  currentApp: AppName
  ChainProps: ChainSwitcherProps<TChainId>
}

export const MobileTopBar = <TChainId extends number>({
  ChainProps,
  currentApp,
  isSidebarOpen,
  toggleSidebar,
  isLite,
}: MobileTopBarProps<TChainId>) => (
  <Box display="flex" flexDirection="row" flexGrow={1} paddingX={2}>
    <MenuToggleButton isOpen={isSidebarOpen} toggle={toggleSidebar} />
    <HeaderLogo isLite={isLite} appName={currentApp} />
    <Box flexGrow={1} />
    <ChainSwitcher {...ChainProps} />
  </Box>
)
