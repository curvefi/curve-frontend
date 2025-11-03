import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import { t } from '@ui-kit/lib/i18n'
import { ArrowTopRightIcon } from '@ui-kit/shared/icons/ArrowTopRightIcon'

// TODO: move it to constants / links file
const LLAMA_MONITOR_BOT_URL = 'https://t.me/LlamalendMonitorBot'

export const LlamaMonitorBotButton = () => (
    <Button
      color="ghost"
      size="extraSmall"
      component={Link}
      sx={{ textDecoration: 'underline', textUnderlineOffset: '2px', '&:hover': { textDecoration: 'underline' } }}
      endIcon={<ArrowTopRightIcon />}
      href={LLAMA_MONITOR_BOT_URL}
      target="_blank"
      rel="noreferrer noopener"
    >
      {t`Get notified with llamamonitorbot`}
    </Button>
  )
