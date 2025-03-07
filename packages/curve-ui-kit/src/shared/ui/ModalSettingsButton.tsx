import Button from '@mui/material/Button'
import { t } from '@ui-kit/lib/i18n'
import { GearIcon } from '@ui-kit/shared/icons/GearIcon'

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
