import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import { APP_LINK, AppNames } from 'curve-common/src/widgets/Header/constants'
import type { AppName } from 'curve-common/src/widgets/Header/types'

export type AppNavAppsProps = { currentApp: AppName }

export const AppButtonLinks = ({ currentApp }: AppNavAppsProps) => (
  <Box display="flex" alignItems="center" marginX={[2, 3, 4]} gap={2}>
    {AppNames.map((appName) => {
      const app = APP_LINK[appName]
      return (
        <Button
          key={appName}
          variant="ghost"
          color="navigation"
          className={currentApp === appName ? 'current' : ''}
          component={Link}
          href={app.route}
        >
          {app.label}
        </Button>
      )
    })}
  </Box>
)
