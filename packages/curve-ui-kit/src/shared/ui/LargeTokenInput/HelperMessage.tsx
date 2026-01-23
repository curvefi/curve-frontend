import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { VERTICAL_CENTER_TEXT } from '@ui-kit/shared/ui/LargeTokenInput/Balance'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { decimal, type Decimal } from '@ui-kit/utils'
import { BalanceButton } from './BalanceButton'

const { Spacing, Sizing } = SizesAndSpaces

type HelperMessageProps = {
  message: string | ReactNode
  isError?: boolean
  /** Callback when a number in the error is clicked. Used to set the max value when balance error is shown. */
  onNumberClick?: (balance: Decimal | undefined) => void
}

/** Matches decimal numbers with optional minus sign and optional fractional part. */
const NUMBER_REGEX = /-?\d+(?:\.\d+)?/g

/**
 * Injects clickable BalanceButton components around numbers in the message.
 * Important: This only works for unformatted numbers!
 */
const buildClickableMessage = (message: string, onNumberClick: (balance: Decimal | undefined) => void) => {
  const matches = message.match(NUMBER_REGEX)
  return matches
    ? message.split(NUMBER_REGEX).flatMap((part, index) => [
        part,
        <BalanceButton key={index} onClick={() => onNumberClick(decimal(matches[index]))}>
          <Typography
            component="span"
            variant="highlightXs"
            color="textPrimary"
            className="balance"
            data-testid={`helper-message-number-${index}`}
            sx={{ ...VERTICAL_CENTER_TEXT }}
          >
            {matches[index]}
          </Typography>
        </BalanceButton>,
      ])
    : [message]
}

export const HelperMessage = ({ message, isError, onNumberClick }: HelperMessageProps) => (
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
        component="div"
        // todo: replace with alert component and add filledfeedback colors to alert component.
        sx={{
          color: (t) =>
            isError ? t.design.Text.TextColors.FilledFeedback.Warning.Primary : t.design.Text.TextColors.Tertiary,
        }}
        data-testid={`helper-message-${isError ? 'error' : 'info'}`}
      >
        {onNumberClick ? buildClickableMessage(message, onNumberClick) : message}
      </Typography>
    ) : (
      message
    )}
  </Box>
)
