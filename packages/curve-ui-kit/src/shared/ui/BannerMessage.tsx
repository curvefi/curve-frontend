import type { ReactNode } from 'react'
import type { Theme } from '@mui/material'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { InvertTheme } from './ThemeProvider'

const SeverityBackground = {
  error: (t: Theme) => t.design.Layer.Feedback.Error,
  warning: (t: Theme) => t.design.Layer.Feedback.Warning,
  info: (t: Theme) => t.design.Color.Primary[800],
}

const { MaxWidth } = SizesAndSpaces

export const BannerMessage = ({
  onClick,
  buttonText,
  children,
  severity,
}: {
  onClick?: () => void
  buttonText?: string
  children: ReactNode
  severity: keyof typeof SeverityBackground
}) => (
  <Stack sx={{ backgroundColor: SeverityBackground[severity] }} alignItems="center">
    <Stack
      direction="row"
      sx={{ width: '100%', maxWidth: MaxWidth.banner }}
      alignItems="center"
      justifyContent="space-between"
    >
      <InvertTheme>
        <Typography color="textPrimary" variant="headingXsBold">
          {children}
        </Typography>
      </InvertTheme>
      {buttonText && (
        <Button color="ghost" onClick={onClick} size="extraSmall">
          {buttonText}
        </Button>
      )}
    </Stack>
  </Stack>
)
