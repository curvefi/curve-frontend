import Button from '@mui/material/Button'
import SettingsIcon from '@mui/icons-material/Settings'
import Typography from '@mui/material/Typography'
import { t } from '@lingui/macro'

export const SettingsButton = (props: { onClick: () => void }) => (
  <Button
    color="ghost"
    size="small"
    onClick={props.onClick}
    startIcon={<SettingsIcon sx={{ fontSize: 22, fill: 'transparent', stroke: 'currentColor' }} />}
  >
    {t`Settings`}
  </Button>
)
