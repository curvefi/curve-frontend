import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { recordEntries } from '@primitives/objects.utils'
import { APP_LINK, type AppMenuOption, getInternalUrl } from '@ui-kit/shared/routes'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

type AppNavAppsProps = {
  currentMenu: AppMenuOption
  networkId: string
}

const { Spacing } = SizesAndSpaces

export const AppButtonLinks = ({ currentMenu, networkId }: AppNavAppsProps) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, marginInline: Spacing.md }}>
    {recordEntries(APP_LINK).map(([menu, { label, routes }]) => (
      <Button
        key={menu}
        color="navigation"
        size="small"
        className={currentMenu === menu ? 'current' : ''}
        component={RouterLink}
        href={getInternalUrl(routes[0].app, networkId)}
        data-testid={`app-link-${menu}`}
      >
        {label}
      </Button>
    ))}
  </Box>
)
