import { ChainSwitcher, ChainSwitcherProps } from '@ui-kit/features/switch-chain'
import Stack from '@mui/material/Stack'
import { MenuToggleButton } from './MenuToggleButton'
import { HeaderLogo } from './HeaderLogo'
import { AppName } from '@ui-kit/shared/routes'

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
  <Stack direction="row" width="100%" paddingX={2}>
    <MenuToggleButton isOpen={isSidebarOpen} toggle={toggleSidebar} />
    <HeaderLogo isLite={isLite} appName={currentApp} />
    <Stack flexGrow={1} />
    <ChainSwitcher {...ChainProps} />
  </Stack>
)
