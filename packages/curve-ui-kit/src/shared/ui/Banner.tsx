import type { ReactNode } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import { type SxProps, type Theme } from '@mui/material'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import IconButton from '@mui/material/IconButton'
import LinkMui from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { ArrowTopRightIcon } from '@ui-kit/shared/icons/ArrowTopRightIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ChangeTheme, InvertTheme } from './ThemeProvider'

type BannerSeverity = 'info' | 'highlight' | 'warning' | 'alert'

const WrapperSx: Record<BannerSeverity, SxProps<Theme>> = {
  info: {
    border: (t) => `1px solid ${t.design.Layer.Highlight.Outline}`,
    backgroundColor: (t) => t.design.Layer[1].Fill,
  },
  highlight: {
    border: (t) => `1px solid ${t.design.Layer.Highlight.Outline}`,
    backgroundColor: (t) => t.design.Color.Primary[800],
  },
  alert: { backgroundColor: (t) => t.design.Layer.Feedback.Error },
  warning: { backgroundColor: (t) => t.design.Layer.Feedback.Warning },
}

const TitlesSx: Record<BannerSeverity, { title: SxProps<Theme>; subtitle: SxProps<Theme> }> = {
  info: {
    title: { color: (t) => t.design.Text.TextColors.FilledFeedback.Info.Primary },
    subtitle: { color: (t) => t.design.Text.TextColors.FilledFeedback.Info.Secondary },
  },
  alert: {
    title: { color: (t) => t.design.Text.TextColors.FilledFeedback.Alert.Primary },
    subtitle: { color: (t) => t.design.Text.TextColors.FilledFeedback.Alert.Secondary },
  },
  warning: {
    title: { color: (t) => t.design.Text.TextColors.FilledFeedback.Warning.Primary },
    subtitle: { color: (t) => t.design.Text.TextColors.FilledFeedback.Warning.Secondary },
  },
  highlight: {
    title: { color: (t) => t.design.Text.TextColors.FilledFeedback.Highlight.Primary },
    subtitle: { color: (t) => t.design.Text.TextColors.FilledFeedback.Highlight.Secondary },
  },
}

const TitleInverted: Record<BannerSeverity, boolean> = {
  info: false,
  alert: true,
  warning: false,
  highlight: true,
}

const { MaxWidth, Spacing } = SizesAndSpaces

export type BannerProps = {
  onClick?: () => void
  buttonText?: string
  children: ReactNode
  severity?: BannerSeverity
  learnMoreUrl?: string
  color?: TypographyProps['color']
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
  color,
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
      ...WrapperSx[severity],
    }}
    data-testid={testId}
  >
    <Stack direction="column" width="100%" maxWidth={MaxWidth.banner}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <InvertTheme inverted={TitleInverted[severity]}>
          <Typography color={color} sx={!color ? TitlesSx[severity].title : undefined} variant="headingXsBold">
            {children}
          </Typography>
        </InvertTheme>
        <Stack direction="row" alignItems="center" justifyContent="start" height="100%">
          {/* todo: currently using light theme on dark theme */}
          <ChangeTheme to={color === '#000' && 'light'}>
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
          </ChangeTheme>
        </Stack>
      </Stack>
      <Stack direction="row" alignItems="center" justifyContent="start" height="100%">
        <Typography sx={TitlesSx[severity].subtitle} variant="bodySRegular">
          {subtitle}
        </Typography>
      </Stack>
    </Stack>
  </Card>
)
