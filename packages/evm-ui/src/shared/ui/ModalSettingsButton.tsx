import { t } from '@evm-ui/lib/i18n'
import { GearIcon } from '@evm-ui/shared/icons/GearIcon'
import Button from '@mui/material/Button'

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
