import Typography from '@mui/material/Typography'
import type { Amount } from '@primitives/decimal.utils'
import { VERTICAL_CENTER_TEXT } from '@ui-kit/shared/ui/LargeTokenInput/large-token-input.utils'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { formatNumber, SxProps } from '@ui-kit/utils'

/**
 * Displays a balance amount with optional loading and disabled states.
 * @see `Balance` component to include a prefix, symbol, tooltip, notional values, and clickable behavior.
 */
export const BalanceAmount = <T extends Amount>({
  children,
  loading = false,
  disabled,
  testId = 'balance-value',
  sx,
}: {
  disabled?: boolean
  children: T | undefined
  loading?: boolean
  testId?: string
  sx?: SxProps
}) => (
  <WithSkeleton loading={loading}>
    <Typography
      component="span"
      className="balance"
      variant="highlightXs"
      color={disabled ? 'textDisabled' : children == null ? 'textTertiary' : 'textPrimary'}
      data-testid={testId}
      data-value={children ?? ''}
      sx={{ ...VERTICAL_CENTER_TEXT, ...sx }}
    >
      {loading ? '???' : children == null ? '-' : formatNumber(children, { abbreviate: true })}
    </Typography>
  </WithSkeleton>
)
