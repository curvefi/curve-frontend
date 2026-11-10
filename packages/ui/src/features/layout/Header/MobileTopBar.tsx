import Stack from '@mui/material/Stack'
import { ChainSwitcher, type ChainSwitcherProps } from '@ui/features/layout/switch-chain'
import { HeaderLogo } from './HeaderLogo'
import { MenuToggleButton } from './MenuToggleButton'

type MobileTopBarProps = ChainSwitcherProps & { toggleSidebar: () => void; isSidebarOpen: boolean }

export const MobileTopBar = ({ isSidebarOpen, toggleSidebar, ...chainSwitcherProps }: MobileTopBarProps) => (
  <Stack direction="row" sx={{ width: '100%', paddingX: 2 }}>
    <MenuToggleButton isOpen={isSidebarOpen} toggle={toggleSidebar} />
    <HeaderLogo />
    <Stack sx={{ flexGrow: 1 }} />
    <ChainSwitcher {...chainSwitcherProps} />
  </Stack>
)
