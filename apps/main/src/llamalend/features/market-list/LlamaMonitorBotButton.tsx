import { LLAMA_MONITOR_BOT_URL } from '@/llamalend/constants'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { ArrowTopRightIcon } from '@ui-kit/shared/icons/ArrowTopRightIcon'
import { BellRingingIcon } from '@ui-kit/shared/icons/BellIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const LlamaMonitorBotButton = () => {
  const isMobile = useIsMobile()
  return isMobile ? (
    <IconButton
      href={LLAMA_MONITOR_BOT_URL}
      target="_blank"
      rel="noreferrer noopener"
      component={Link}
      size="extraSmall"
      sx={{ marginInlineEnd: Spacing.lg }}
    >
      <BellRingingIcon />
    </IconButton>
  ) : (
    <Button
      className="group"
      color="ghost"
      size="extraSmall"
      component={Link}
      sx={{ textDecoration: 'underline', textUnderlineOffset: '2px', '&:hover': { textDecoration: 'underline' } }}
      startIcon={<BellRingingIcon fontSize={'small'} />}
      endIcon={<ArrowTopRightIcon fontSize={'small'} />}
      href={LLAMA_MONITOR_BOT_URL}
      target="_blank"
      rel="noreferrer noopener"
    >
      {t`Get notified with LlamaMonitor bot`}
    </Button>
  )
}
