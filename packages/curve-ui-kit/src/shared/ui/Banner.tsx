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

type BannerSeverity = 'default' | 'highlight' | 'warning' | 'alert'

const WrapperSx: Record<BannerSeverity, SxProps<Theme>> = {
  default: {
    border: t => `1px solid ${t.design.Layer.Highlight.Outline}`,
    backgroundColor: t => t.design.Layer[1].Fill,
  },
  highlight: {
    border: t => `1px solid ${t.design.Layer.Highlight.Outline}`,
    backgroundColor: t => t.design.Color.Primary[800],
  },
  alert: { backgroundColor: t => t.design.Layer.Feedback.Error },
  warning: { backgroundColor: t => t.design.Layer.Feedback.Warning },
}

const TitleColor: Record<BannerSeverity, TypographyProps['color']> = {
  default: 'textHighlight',
  alert: 'textPrimary',
  warning: 'textPrimary',
  highlight: 'textPrimary',
}

const TitleInverted: Record<BannerSeverity, boolean> = {
  default: false,
  alert: true,
  warning: false,
  highlight: true,
}

const { MaxWidth, Spacing } = SizesAndSpaces

/**
 * Banner message component used to display important information with different severity levels.
 * This is not complete yet: it doesn't support a subtitle or a close button from the design system.
 */
export const Banner = ({
  onClick,
  buttonText,
  children,
  severity = 'default',
  learnMoreUrl,
  color,
}: {
  onClick?: () => void
  buttonText?: string
  children: ReactNode
  severity?: BannerSeverity
  learnMoreUrl?: string
  color?: TypographyProps['color']
}) => (
  <Card
    sx={{
      display: 'flex',
      gap: Spacing.md,
      alignSelf: 'stretch',
      paddingInline: Spacing.md,
      paddingBlock: Spacing.xs,
      alignItems: 'center',
      justifyContent: 'center',
      ...WrapperSx[severity],
    }}
  >
    <Stack
      direction="row"
      sx={{ width: '100%', maxWidth: MaxWidth.banner }}
      alignItems="center"
      justifyContent="space-between"
    >
      <InvertTheme inverted={TitleInverted[severity]}>
        <Typography color={color ?? TitleColor[severity]} variant="headingXsBold">
          {children}
        </Typography>
      </InvertTheme>
      <Stack direction="row" alignItems="center" justifyContent="start" height="100%">
        {/* fixme: currently using light theme on dark theme */}
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
  </Card>
)
