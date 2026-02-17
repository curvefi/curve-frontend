import { LLAMA_MONITOR_BOT_URL } from '@/llamalend/constants'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import NotificationsIcon from '@mui/icons-material/Notifications'
import Button from '@mui/material/Button'
import type { ButtonOwnProps } from '@mui/material/Button'
import { t } from '@ui-kit/lib/i18n'

const LLAMA_MONITOR_BOT_URL_WITH_REF = `${LLAMA_MONITOR_BOT_URL}?ref=news.curve.finance`

type LlamaMonitorBotLinkButtonProps = {
  size?: ButtonOwnProps['size']
}

export const LlamaMonitorBotLinkButton = ({ size }: LlamaMonitorBotLinkButtonProps) => (
  <Button
    variant="link"
    color="ghost"
    href={LLAMA_MONITOR_BOT_URL_WITH_REF}
    target="_blank"
    rel="noreferrer"
    size={size}
    sx={{ flexShrink: 0 }}
    startIcon={<NotificationsIcon sx={(t) => ({ fontSize: t.typography.fontSize })} />}
    endIcon={<ArrowOutwardIcon sx={(t) => ({ fontSize: t.typography.fontSize })} />}
  >
    {t`Get alerts`}
  </Button>
)
