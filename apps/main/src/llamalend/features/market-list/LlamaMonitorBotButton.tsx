import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { ArrowTopRightIcon } from '@ui-kit/shared/icons/ArrowTopRightIcon'
import { BellIcon } from '@ui-kit/shared/icons/BellIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces
// TODO: move it to constants / links file
const LLAMA_MONITOR_BOT_URL = 'https://t.me/LlamalendMonitorBot'

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
      <BellIcon />
    </IconButton>
  ) : (
    <Button
      color="ghost"
      size="extraSmall"
      component={Link}
      sx={{ textDecoration: 'underline', textUnderlineOffset: '2px', '&:hover': { textDecoration: 'underline' } }}
      startIcon={<BellIcon fontSize={'small'} />}
      endIcon={<ArrowTopRightIcon fontSize={'small'} />}
      href={LLAMA_MONITOR_BOT_URL}
      target="_blank"
      rel="noreferrer noopener"
    >
      {t`Get notified with llamamonitorbot`}
    </Button>
  )
}
