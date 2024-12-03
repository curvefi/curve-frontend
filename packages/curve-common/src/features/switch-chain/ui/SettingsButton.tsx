import Button from '@mui/material/Button'
import SettingsIcon from '@mui/icons-material/Settings'
import Typography from '@mui/material/Typography'
import { t } from '@lingui/macro'

export const SettingsButton = (props: { onClick: () => void }) => (
  <Button color="ghost" size="small" onClick={props.onClick}>
    <SettingsIcon sx={{ fontSize: 22, fill: 'transparent', stroke: 'currentColor' }} />
    <Typography
      sx={{ marginLeft: 1, verticalAlign: 'top' }}
      variant="bodyMBold"
      color="navigation"
      data-testid="sidebar-settings"
    >
      {t`Settings`}
    </Typography>
  </Button>
)