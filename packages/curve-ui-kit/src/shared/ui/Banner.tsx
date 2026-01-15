import type { ReactNode } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import { type SxProps, type Theme } from '@mui/material'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import IconButton from '@mui/material/IconButton'
import LinkMui from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { ArrowTopRightIcon } from '@ui-kit/shared/icons/ArrowTopRightIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon'
import { InfoCircledIcon } from '../icons/InfoCircledIcon'
import { LlamaIcon } from '../icons/LlamaIcon'

const { MaxWidth, Spacing, IconSize } = SizesAndSpaces

type BannerSeverity = 'info' | 'highlight' | 'warning' | 'alert'
type BannerIcons = BannerSeverity | 'llama'

const BannerSx: Record<BannerSeverity, { title: SxProps<Theme>; subtitle: SxProps<Theme>; wrapper: SxProps<Theme> }> = {
  info: {
    title: { color: (t) => t.design.Text.TextColors.FilledFeedback.Info.Primary },
    subtitle: { color: (t) => t.design.Text.TextColors.FilledFeedback.Info.Secondary },
    wrapper: {
      border: (t) => `1px solid ${t.design.Layer.Highlight.Outline}`,
      backgroundColor: (t) => t.design.Layer[1].Fill,
    },
  },
  highlight: {
    title: { color: (t) => t.design.Text.TextColors.FilledFeedback.Highlight.Primary },
    subtitle: { color: (t) => t.design.Text.TextColors.FilledFeedback.Highlight.Secondary },
    wrapper: { backgroundColor: (t) => t.design.Layer.Feedback.Info },
  },
  warning: {
    title: { color: (t) => t.design.Text.TextColors.FilledFeedback.Warning.Primary },
    subtitle: { color: (t) => t.design.Text.TextColors.FilledFeedback.Warning.Secondary },
    wrapper: { backgroundColor: (t) => t.design.Layer.Feedback.Warning },
  },
  alert: {
    title: { color: (t) => t.design.Text.TextColors.FilledFeedback.Alert.Primary },
    subtitle: { color: (t) => t.design.Text.TextColors.FilledFeedback.Alert.Secondary },
    wrapper: { backgroundColor: (t) => t.design.Layer.Feedback.Error },
  },
}

const IconSx = { width: IconSize.sm, height: IconSize.sm, verticalAlign: 'text-bottom' }

const BannerIcons: Record<BannerIcons, ReactNode> = {
  info: <InfoCircledIcon sx={IconSx} />,
  highlight: <InfoCircledIcon sx={IconSx} />,
  warning: <ExclamationTriangleIcon sx={IconSx} />,
  alert: <ExclamationTriangleIcon sx={IconSx} />,
  llama: <LlamaIcon sx={IconSx} />,
}

export type BannerProps = {
  onClick?: () => void
  buttonText?: string
  children: ReactNode
  severity?: BannerSeverity
  // icon shown before the title, default to severity icon
  icon?: BannerIcons
  learnMoreUrl?: string
  subtitle?: ReactNode
  testId?: string
}

/**
 * Banner message component used to display important information with different severity levels.
 */
export const Banner = ({
  onClick,
  buttonText,
  children,
  severity = 'info',
  icon = severity,
  learnMoreUrl,
  subtitle,
  testId,
}: BannerProps) => (
  <Card
    sx={{
      display: 'flex',
      alignSelf: 'stretch',
      paddingInline: Spacing.sm,
      paddingBlock: Spacing.xs,
      justifyContent: 'center',
      ...BannerSx[severity].wrapper,
    }}
    data-testid={testId}
  >
    <Stack width="100%" maxWidth={MaxWidth.banner}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={Spacing.sm}>
        <Typography sx={{ ...BannerSx[severity].title }} variant="headingXsBold">
          {BannerIcons[icon]} {children}
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="start">
          {learnMoreUrl && (
            <Button
              component={LinkMui}
              href={learnMoreUrl}
              target="_blank"
              color="ghost"
              variant="link"
              endIcon={<ArrowTopRightIcon fontSize="small" />}
              size="extraSmall"
              sx={{ ...BannerSx[severity].title }}
            >
              {t`Learn more`}
            </Button>
          )}
          {onClick &&
            (buttonText ? (
              <Button color="ghost" onClick={onClick} size="extraSmall" sx={{ ...BannerSx[severity].title }}>
                {buttonText}
              </Button>
            ) : (
              <IconButton onClick={onClick} size="extraSmall" sx={{ ...BannerSx[severity].title }}>
                <CloseIcon />
              </IconButton>
            ))}
        </Stack>
      </Stack>
      <Stack direction="row" alignItems="center" justifyContent="start">
        <Typography sx={{ ...BannerSx[severity].subtitle }} variant="bodySRegular">
          {subtitle}
        </Typography>
      </Stack>
    </Stack>
  </Card>
)
