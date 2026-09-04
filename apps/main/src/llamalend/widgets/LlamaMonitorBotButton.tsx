import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { ArrowTopRightIcon } from '@ui/icons/ArrowTopRightIcon'
import { BellRingingIcon } from '@ui/icons/BellIcon'
import { t } from '@ui/lib/i18n'
import { CURVE_SOCIALS } from '@ui/lib/resource.constants'

const { Spacing } = SizesAndSpaces

export const LlamaMonitorBotButton = () =>
  useIsMobile() ? (
    <IconButton
      href={CURVE_SOCIALS.telegram.llamalendMonitorBot}
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
      sx={{
        textDecoration: 'underline',
        textUnderlineOffset: '2px',
        textWrapMode: 'nowrap',
        '&:hover': { textDecoration: 'underline' },
      }}
      startIcon={<BellRingingIcon fontSize="small" />}
      endIcon={<ArrowTopRightIcon fontSize="small" />}
      href={CURVE_SOCIALS.telegram.llamalendMonitorBot}
      target="_blank"
      rel="noreferrer noopener"
    >
      {t`Get alerts`}
    </Button>
  )
