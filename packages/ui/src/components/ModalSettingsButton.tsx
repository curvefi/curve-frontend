import Button from '@mui/material/Button'
import { GearIcon } from '@ui/icons/GearIcon'
import { t } from '@ui/lib/i18n'

export const ModalSettingsButton = (props: { onClick: () => void }) => (
  <Button
    color="ghost"
    size="small"
    onClick={props.onClick}
    startIcon={<GearIcon sx={{ fontSize: 22, fill: 'transparent', stroke: 'currentColor' }} />}
  >
    {t`Settings`}
  </Button>
)
