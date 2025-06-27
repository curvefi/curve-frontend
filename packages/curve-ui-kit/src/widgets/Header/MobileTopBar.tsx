import Stack from '@mui/material/Stack'
import { ChainSwitcher, ChainSwitcherProps } from '@ui-kit/features/switch-chain'
import { type AppMenuOption } from '@ui-kit/shared/routes'
import { HeaderLogo } from './HeaderLogo'
import { MenuToggleButton } from './MenuToggleButton'

export type MobileTopBarProps = {
  toggleSidebar: () => void
  isSidebarOpen: boolean
  isLite: boolean
  currentMenu: AppMenuOption
  ChainProps: ChainSwitcherProps
}

export const MobileTopBar = ({ ChainProps, currentMenu, isSidebarOpen, toggleSidebar, isLite }: MobileTopBarProps) => (
  <Stack direction="row" width="100%" paddingX={2}>
    <MenuToggleButton isOpen={isSidebarOpen} toggle={toggleSidebar} />
    <HeaderLogo isLite={isLite} currentMenu={currentMenu} />
    <Stack flexGrow={1} />
    <ChainSwitcher {...ChainProps} />
  </Stack>
)
