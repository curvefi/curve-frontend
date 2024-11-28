import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import { APP_LINK, AppNames, type AppName } from 'curve-ui-kit/src/shared/routes'

export type AppNavAppsProps = { selectedApp: AppName; onChange: (appName: AppName) => void }

export const AppButtonLinks = ({ selectedApp, onChange }: AppNavAppsProps) => (
  <Box display="flex" alignItems="center" marginX={[2, 3, 4]} gap={2}>
    {AppNames.map((appName) => (
      <Button
        key={appName}
        variant="ghost"
        color="navigation"
        className={selectedApp === appName ? 'current' : ''}
        component={Link}
        onClick={() => onChange(appName)}
      >
        {APP_LINK[appName].label}
      </Button>
    ))}
  </Box>
)
