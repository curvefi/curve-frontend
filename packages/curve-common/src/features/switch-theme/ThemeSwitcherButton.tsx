import { FunctionComponent } from 'react'
import type { Theme } from '@mui/system'
import { type ThemeSwitcherProps } from './types'
import { Button } from 'curve-ui-kit/src/shared/ui/Button'
import { Box } from 'curve-ui-kit/src/shared/ui/Box'
import { t } from '@lingui/macro'
import { useThemeToggle } from './useThemeToggle'

export const ThemeSwitcherButton: FunctionComponent<ThemeSwitcherProps> = ({ theme, onChange }) => {
  const [ component, onClick ] = useThemeToggle({ theme, onChange })
  const Icon = (
    <Box sx={{ minWidth: 38 }}>
      {component}
    </Box>
  )
  return (
    <Button
      onClick={onClick}
      endIcon={Icon}
      variant="ghost"
      color="secondary"
      sx={{
        fill: (t: Theme) => t.palette.text.secondary,
        '&:hover': {fill: (t: Theme) => t.palette.primary.contrastText},
      }}
    >
      {t`Mode`}
    </Button>
  )
}