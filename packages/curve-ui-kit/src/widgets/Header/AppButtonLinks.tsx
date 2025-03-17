import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import { APP_LINK, type AppMenuOption, getInternalUrl } from '@ui-kit/shared/routes'

type AppNavAppsProps = { currentMenu: AppMenuOption; onChange: (appName: AppMenuOption) => void; networkName: string }

export const AppButtonLinks = ({ currentMenu, onChange, networkName }: AppNavAppsProps) => (
  <Box display="flex" alignItems="center" marginX={[2, 3, 4]} gap={2}>
    {Object.entries(APP_LINK).map(([menu, { label, pages }]) => (
      <Button
        key={menu}
        color="navigation"
        size="small"
        className={currentMenu === menu ? 'current' : ''}
        component={Link}
        onClick={() => onChange(menu as AppMenuOption)}
        href={getInternalUrl(pages[0].app, networkName)}
        data-testid={`app-link-${menu}`}
      >
        {label}
      </Button>
    ))}
  </Box>
)
