import { ChainSwitcher } from '@evm-ui/features/switch-chain'
import type { AppMenuOption } from '@evm-ui/shared/routes'
import { NetworkMapping } from '@legacy-ui/utils'
import Stack from '@mui/material/Stack'
import { HeaderLogo } from './HeaderLogo'
import { MenuToggleButton } from './MenuToggleButton'

type MobileTopBarProps = {
  toggleSidebar: () => void
  isSidebarOpen: boolean
  supportedNetworks: NetworkMapping
  currentMenu: AppMenuOption
}

export const MobileTopBar = ({ supportedNetworks, isSidebarOpen, toggleSidebar, currentMenu }: MobileTopBarProps) => (
  <Stack direction="row" sx={{ width: '100%', paddingX: 2 }}>
    <MenuToggleButton isOpen={isSidebarOpen} toggle={toggleSidebar} />
    <HeaderLogo />
    <Stack sx={{ flexGrow: 1 }} />
    <ChainSwitcher supportedNetworks={supportedNetworks} currentMenu={currentMenu} />
  </Stack>
)
