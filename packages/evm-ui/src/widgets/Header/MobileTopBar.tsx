import { ChainSwitcher } from '@evm-ui/features/switch-chain'
import type { ChainSwitcherProps } from '@evm-ui/features/switch-chain/ui/ChainSwitcher'
import Stack from '@mui/material/Stack'
import { HeaderLogo } from './HeaderLogo'
import { MenuToggleButton } from './MenuToggleButton'

type MobileTopBarProps<TApp extends string, TId extends string, TChainId extends number> = ChainSwitcherProps<
  TId,
  TChainId,
  TApp
> & {
  toggleSidebar: () => void
  isSidebarOpen: boolean
}

export const MobileTopBar = <TApp extends string, TId extends string, TChainId extends number>({
  isSidebarOpen,
  toggleSidebar,
  ...chainSwitcherProps
}: MobileTopBarProps<TApp, TId, TChainId>) => (
  <Stack direction="row" sx={{ width: '100%', paddingX: 2 }}>
    <MenuToggleButton isOpen={isSidebarOpen} toggle={toggleSidebar} />
    <HeaderLogo />
    <Stack sx={{ flexGrow: 1 }} />
    <ChainSwitcher {...chainSwitcherProps} />
  </Stack>
)
