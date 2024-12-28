import Button from '@mui/material/Button'
import { t } from '@lingui/macro'
import { GearIcon } from '@ui-kit/shared/icons/GearIcon'

export const SettingsButton = (props: { onClick: () => void }) => (
  <Button
    color="ghost"
    size="small"
    onClick={props.onClick}
    startIcon={<GearIcon sx={{ fontSize: 22, fill: 'transparent', stroke: 'currentColor' }} />}
  >
    {t`Settings`}
  </Button>
)
