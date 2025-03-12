import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import { APP_LINK, AppNames, type AppName } from '@ui-kit/shared/routes'

type AppNavAppsProps = { selectedApp: AppName; onChange: (appName: AppName) => void; networkName: string }

export const AppButtonLinks = ({ selectedApp, onChange, networkName }: AppNavAppsProps) => (
  <Box display="flex" alignItems="center" marginX={[2, 3, 4]} gap={2}>
    {AppNames.map((appName) => (
      <Button
        key={appName}
        color="navigation"
        size="small"
        className={selectedApp === appName ? 'current' : ''}
        component={Link}
        onClick={() => onChange(appName)}
        href={`${APP_LINK[appName].root}/${networkName}`}
        data-testid={`app-link-${appName}`}
      >
        {APP_LINK[appName].label}
      </Button>
    ))}
  </Box>
)
