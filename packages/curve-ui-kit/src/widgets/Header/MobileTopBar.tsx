import Stack from '@mui/material/Stack'
import { NetworkMapping } from '@ui/utils'
import { ChainSwitcher } from '@ui-kit/features/switch-chain'
import { type AppMenuOption } from '@ui-kit/shared/routes'
import { HeaderLogo } from './HeaderLogo'
import { MenuToggleButton } from './MenuToggleButton'

export type MobileTopBarProps = {
  toggleSidebar: () => void
  isSidebarOpen: boolean
  isLite: boolean
  currentMenu: AppMenuOption
  networks: NetworkMapping
}

export const MobileTopBar = ({ networks, currentMenu, isSidebarOpen, toggleSidebar, isLite }: MobileTopBarProps) => (
  <Stack direction="row" width="100%" paddingX={2}>
    <MenuToggleButton isOpen={isSidebarOpen} toggle={toggleSidebar} />
    <HeaderLogo />
    <Stack flexGrow={1} />
    <ChainSwitcher networks={networks} />
  </Stack>
)
