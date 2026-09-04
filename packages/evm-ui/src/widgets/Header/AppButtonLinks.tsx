import { APP_LINK, type AppMenuOption, getInternalUrl } from '@evm-ui/shared/routes'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { recordEntries } from '@primitives/objects.utils'
import { RouterLink } from '@ui/components/RouterLink'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

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
