import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import { keyframes } from '@mui/material/styles'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { ArrowTopRightIcon } from '@ui-kit/shared/icons/ArrowTopRightIcon'
import { BellIcon } from '@ui-kit/shared/icons/BellIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces
// TODO: move it to constants / links file
const LLAMA_MONITOR_BOT_URL = 'https://t.me/LlamalendMonitorBot'

// Bell ringing animation - smooth shake with rotation
const bellRing = keyframes`
  0% { transform: rotate(0deg); }
  10% { transform: rotate(14deg); }
  20% { transform: rotate(-12deg); }
  30% { transform: rotate(10deg); }
  40% { transform: rotate(-8deg); }
  50% { transform: rotate(6deg); }
  60% { transform: rotate(-4deg); }
  70% { transform: rotate(2deg); }
  80% { transform: rotate(-1deg); }
  90% { transform: rotate(0.5deg); }
  100% { transform: rotate(0deg); }
`

export const LlamaMonitorBotButton = () => {
  const isMobile = useIsMobile()
  return isMobile ? (
    <IconButton
      href={LLAMA_MONITOR_BOT_URL}
      target="_blank"
      rel="noreferrer noopener"
      component={Link}
      size="extraSmall"
      sx={{
        marginInlineEnd: Spacing.lg,
        '&:hover svg': {
          animation: `${bellRing} 0.6s ease-in-out`,
          transformOrigin: 'top center',
        },
      }}
    >
      <BellIcon />
    </IconButton>
  ) : (
    <Button
      color="ghost"
      size="extraSmall"
      component={Link}
      sx={{
        textDecoration: 'underline',
        textUnderlineOffset: '2px',
        '&:hover': { textDecoration: 'underline' },
        '&:hover .MuiButton-startIcon svg': {
          animation: `${bellRing} 0.6s ease-in-out`,
          transformOrigin: 'top center',
        },
      }}
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
