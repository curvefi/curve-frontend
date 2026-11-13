import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import { BellRingingIcon } from '@ui/icons/BellIcon'
import { t } from '@ui/lib/i18n'
import { CURVE_SOCIALS } from '@ui/lib/resource.constants'

export const LlamaMonitorBotButton = () => (
  <IconButton
    href={CURVE_SOCIALS.telegram.llamalendMonitorBot}
    target="_blank"
    rel="noreferrer noopener"
    component={Link}
    size="extraSmall"
    aria-label={t`Get alerts`}
  >
    <BellRingingIcon />
  </IconButton>
)
