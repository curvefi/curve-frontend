import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import { CURVE_SOCIALS } from '@ui/utils'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { ArrowTopRightIcon } from '@ui-kit/shared/icons/ArrowTopRightIcon'
import { BellRingingIcon } from '@ui-kit/shared/icons/BellIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

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
      startIcon={<BellRingingIcon fontSize={'small'} />}
      endIcon={<ArrowTopRightIcon fontSize={'small'} />}
      href={CURVE_SOCIALS.telegram.llamalendMonitorBot}
      target="_blank"
      rel="noreferrer noopener"
    >
      {t`Get alerts`}
    </Button>
  )
