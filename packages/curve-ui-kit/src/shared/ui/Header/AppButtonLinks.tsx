import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import { APP_LINK } from 'ui/src/AppNav/constants'
import { AppName, AppNames } from 'ui/src/AppNav/types'
import { RouterLink } from '../RouterLink'

export type AppNavAppsProps = { currentApp: AppName }

export const AppButtonLinks = ({ currentApp }: AppNavAppsProps) => (
  <Box>
    {AppNames.map((appName) => {
      const app = APP_LINK[appName]
      const isActive = currentApp === appName
      return (
        <Button
          key={appName}
          variant={isActive ? 'contained' : 'ghost'}
          color={isActive ? 'primary' : 'inherit'}
          component={RouterLink}
          href={app.route}
        >
          {app.label}
        </Button>
      )
    })}
  </Box>
)
