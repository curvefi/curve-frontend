import { ChainSwitcher } from '@evm-ui/features/switch-chain'
import type { ChainSwitcherProps } from '@evm-ui/features/switch-chain/ui/ChainSwitcher'
import Stack from '@mui/material/Stack'
import { HeaderLogo } from './HeaderLogo'
import { MenuToggleButton } from './MenuToggleButton'

type MobileTopBarProps<TMenuApp extends string, TId extends string, TChainId extends number> = ChainSwitcherProps<
  TId,
  TChainId,
  TMenuApp
> & {
  toggleSidebar: () => void
  isSidebarOpen: boolean
}

export const MobileTopBar = <TMenuApp extends string, TId extends string, TChainId extends number>({
  isSidebarOpen,
  toggleSidebar,
  ...chainSwitcherProps
}: MobileTopBarProps<TMenuApp, TId, TChainId>) => (
  <Stack direction="row" sx={{ width: '100%', paddingX: 2 }}>
    <MenuToggleButton isOpen={isSidebarOpen} toggle={toggleSidebar} />
    <HeaderLogo />
    <Stack sx={{ flexGrow: 1 }} />
    <ChainSwitcher {...chainSwitcherProps} />
  </Stack>
)
