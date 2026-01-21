import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, Sizing } = SizesAndSpaces

type HelperMessageProps = {
  message: string | ReactNode
  isError?: boolean
}

export const HelperMessage = ({ message, isError }: HelperMessageProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: (t) => t.design.Layer[3].Fill,
      padding: Spacing.sm,
      minHeight: Sizing.sm,
      ...(isError && { backgroundColor: (t) => t.design.Layer.Feedback.Error }),
    }}
  >
    {typeof message === 'string' ? (
      <Typography
        variant="bodyXsRegular"
        // todo: replace with alert component and add filledfeedback colors to alert component.
        sx={{
          color: (t) =>
            isError ? t.design.Text.TextColors.FilledFeedback.Warning.Primary : t.design.Text.TextColors.Tertiary,
        }}
        data-testid={`helper-message-${isError ? 'error' : 'info'}`}
      >
        {message}
      </Typography>
    ) : (
      message
    )}
  </Box>
)
