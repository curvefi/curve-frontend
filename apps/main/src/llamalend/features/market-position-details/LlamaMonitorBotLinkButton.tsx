import { LLAMA_MONITOR_BOT_URL } from '@/llamalend/constants'
import NotificationsIcon from '@mui/icons-material/Notifications'
import { t } from '@ui-kit/lib/i18n'
import { ExternalLink } from '@ui-kit/shared/ui/ExternalLink'

export const LlamaMonitorBotLinkButton = () => (
  <ExternalLink
    href={LLAMA_MONITOR_BOT_URL}
    label={t`Get alerts`}
    sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
    startIcon={<NotificationsIcon />}
  />
)
