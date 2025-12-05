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

type BannerSeverity = 'info' | 'highlight' | 'warning' | 'alert'

const BannerSx: Record<BannerSeverity, { title: SxProps<Theme>; subtitle: SxProps<Theme>; wrapper: SxProps<Theme> }> = {
  info: {
    title: { color: (t) => t.design.Text.TextColors.FilledFeedback.Info.Primary },
    subtitle: { color: (t) => t.design.Text.TextColors.FilledFeedback.Info.Secondary },
    wrapper: {
      border: (t) => `1px solid ${t.design.Layer.Highlight.Outline}`,
      backgroundColor: (t) => t.design.Layer[1].Fill,
    },
  },
  alert: {
    title: { color: (t) => t.design.Text.TextColors.FilledFeedback.Alert.Primary },
    subtitle: { color: (t) => t.design.Text.TextColors.FilledFeedback.Alert.Secondary },
    wrapper: { backgroundColor: (t) => t.design.Layer.Feedback.Error },
  },
  warning: {
    title: { color: (t) => t.design.Text.TextColors.FilledFeedback.Warning.Primary },
    subtitle: { color: (t) => t.design.Text.TextColors.FilledFeedback.Warning.Secondary },
    wrapper: { backgroundColor: (t) => t.design.Layer.Feedback.Warning },
  },
  highlight: {
    title: { color: (t) => t.design.Text.TextColors.FilledFeedback.Highlight.Primary },
    subtitle: { color: (t) => t.design.Text.TextColors.FilledFeedback.Highlight.Secondary },
    wrapper: { backgroundColor: (t) => t.design.Layer.Feedback.Info },
  },
}

const { MaxWidth, Spacing } = SizesAndSpaces

export type BannerProps = {
  onClick?: () => void
  buttonText?: string
  children: ReactNode
  severity?: BannerSeverity
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
  learnMoreUrl,
  subtitle,
  testId,
}: BannerProps) => (
  <Card
    sx={{
      display: 'flex',
      alignSelf: 'stretch',
      paddingInline: Spacing.md,
      paddingBlock: Spacing.xs,
      justifyContent: 'center',
      ...BannerSx[severity].wrapper,
    }}
    data-testid={testId}
  >
    <Stack direction="column" width="100%" maxWidth={MaxWidth.banner}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography sx={{ ...BannerSx[severity].title }} variant="headingXsBold">
          {children}
        </Typography>
        <Stack direction="row" alignItems="center" justifyContent="start" height="100%">
          {learnMoreUrl && (
            <Button
              component={LinkMui}
              href={learnMoreUrl}
              target="_blank"
              color="ghost"
              variant="link"
              endIcon={<ArrowTopRightIcon />}
              size="extraSmall"
            >
              {t`Learn more`}
            </Button>
          )}
          {/* TODO: fix button colors */}
          {onClick &&
            (buttonText ? (
              <Button color="ghost" onClick={onClick} size="extraSmall">
                {buttonText}
              </Button>
            ) : (
              <IconButton onClick={onClick} size="extraSmall">
                <CloseIcon />
              </IconButton>
            ))}
        </Stack>
      </Stack>
      <Stack direction="row" alignItems="center" justifyContent="start" height="100%">
        <Typography sx={{ ...BannerSx[severity].subtitle }} variant="bodySRegular">
          {subtitle}
        </Typography>
      </Stack>
    </Stack>
  </Card>
)
