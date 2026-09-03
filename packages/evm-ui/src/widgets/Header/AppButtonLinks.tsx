import { APP_LINK, type AppMenuOption, getInternalUrl } from '@evm-ui/shared/routes'
import { RouterLink } from '@evm-ui/shared/ui/RouterLink'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { recordEntries } from '@primitives/objects.utils'

type AppNavAppsProps = { currentMenu: AppMenuOption; blockchainId: string }

const { Spacing } = SizesAndSpaces

export const AppButtonLinks = ({ currentMenu, blockchainId }: AppNavAppsProps) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginInline: Spacing.md }}>
    {recordEntries(APP_LINK).map(([menu, { label, routes }]) => (
      <Button
        key={menu}
        color="navigation"
        size="small"
        className={currentMenu === menu ? 'current' : ''}
        component={RouterLink}
        href={getInternalUrl(routes[0].app, blockchainId)}
        data-testid={`app-link-${menu}`}
      >
        {label}
      </Button>
    ))}
  </Box>
)
