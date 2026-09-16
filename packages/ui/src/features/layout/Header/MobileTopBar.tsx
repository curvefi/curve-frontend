import Stack from '@mui/material/Stack'
import { ChainSwitcher } from '@ui/features/layout/switch-chain'
import type { ChainSwitcherProps } from '@ui/features/layout/switch-chain/ui/ChainSwitcher'
import { HeaderLogo } from './HeaderLogo'
import { MenuToggleButton } from './MenuToggleButton'

type MobileTopBarProps<TApp extends string> = ChainSwitcherProps<TApp> & {
  toggleSidebar: () => void
  isSidebarOpen: boolean
}

export const MobileTopBar = <TApp extends string>({
  isSidebarOpen,
  toggleSidebar,
  ...chainSwitcherProps
}: MobileTopBarProps<TApp>) => (
  <Stack direction="row" sx={{ width: '100%', paddingX: 2 }}>
    <MenuToggleButton isOpen={isSidebarOpen} toggle={toggleSidebar} />
    <HeaderLogo />
    <Stack sx={{ flexGrow: 1 }} />
    <ChainSwitcher {...chainSwitcherProps} />
  </Stack>
)
