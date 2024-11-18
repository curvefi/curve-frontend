import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import { APP_LINK, AppNames } from 'curve-common/src/widgets/Header/constants'
import type { AppName } from 'curve-common/src/widgets/Header/types'

export type AppNavAppsProps = { currentApp: AppName }

export const AppButtonLinks = ({ currentApp }: AppNavAppsProps) => (
  <Box display="flex" alignItems="center" marginX={[2,3,4]}>
    {AppNames.map((appName) => {
      const app = APP_LINK[appName]
      const isActive = currentApp === appName
      return (
        <Button
          key={appName}
          variant={isActive ? 'contained' : 'ghost'}
          color={isActive ? 'primary' : 'secondary'}
          component={Link}
          href={app.route}
        >
          {app.label}
        </Button>
      )
    })}
  </Box>
)
