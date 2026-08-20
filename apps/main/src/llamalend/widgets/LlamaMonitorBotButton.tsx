import { CURVE_SOCIALS } from '@legacy-ui/utils'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import { t } from '@evm-ui/lib/i18n'
import { ArrowTopRightIcon } from '@evm-ui/shared/icons/ArrowTopRightIcon'
import { BellRingingIcon } from '@evm-ui/shared/icons/BellIcon'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'

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
