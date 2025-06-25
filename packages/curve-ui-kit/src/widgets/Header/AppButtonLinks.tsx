import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { APP_LINK, type AppMenuOption, getInternalUrl } from '@ui-kit/shared/routes'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'

type AppNavAppsProps = { currentMenu: AppMenuOption; onChange: (appName: AppMenuOption) => void; networkId: string }

export const AppButtonLinks = ({ currentMenu, onChange, networkId }: AppNavAppsProps) => (
  <Box display="flex" alignItems="center" marginX={[2, 3, 4]} gap={2}>
    {Object.entries(APP_LINK).map(([menu, { label, routes }]) => (
      <Button
        key={menu}
        color="navigation"
        size="small"
        className={currentMenu === menu ? 'current' : ''}
        component={RouterLink}
        onClick={() => onChange(menu as AppMenuOption)}
        href={getInternalUrl(routes[0].app, networkId)}
        data-testid={`app-link-${menu}`}
      >
        {label}
      </Button>
    ))}
  </Box>
)
