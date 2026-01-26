import Typography from '@mui/material/Typography'
import { VERTICAL_CENTER_TEXT } from '@ui-kit/shared/ui/LargeTokenInput/large-token-input.utils'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { type Amount, formatNumber } from '@ui-kit/utils'

/**
 * Displays a balance amount with optional loading and disabled states.
 * @see `Balance` component to include a prefix, symbol, tooltip, notional values, and clickable behavior.
 */
export const BalanceAmount = <T extends Amount>({
  children,
  loading = false,
  disabled,
  testId = 'balance-value',
}: {
  disabled?: boolean
  children: T | undefined
  loading?: boolean
  testId?: string
}) => (
  <WithSkeleton loading={loading}>
    <Typography
      component="span"
      className="balance"
      variant="highlightXs"
      color={disabled ? 'textDisabled' : children == null ? 'textTertiary' : 'textPrimary'}
      data-testid={testId}
      sx={{ ...VERTICAL_CENTER_TEXT }}
    >
      {loading ? '???' : children == null ? '-' : formatNumber(children, { abbreviate: true })}
    </Typography>
  </WithSkeleton>
)
