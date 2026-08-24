import { VERTICAL_CENTER_TEXT } from '@evm-ui/shared/ui/LargeTokenInput/large-token-input.utils'
import { WithSkeleton } from '@evm-ui/shared/ui/WithSkeleton'
import { formatNumber, SxProps } from '@evm-ui/utils'
import Typography from '@mui/material/Typography'
import type { Amount } from '@primitives/decimal.utils'

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
  <WithSkeleton loading={loading} sx={sx}>
    <Typography
      className="balance"
      variant="highlightXs"
      {...(children != null && { 'data-testid': testId })}
      data-value={children ?? ''}
      sx={{
        ...VERTICAL_CENTER_TEXT,
        color: t => t.design.Inputs.Text[disabled ? 'Disabled' : children == null ? 'MetaSubtle' : 'Value'],
        ...sx,
      }}
    >
      {loading ? '?????' : formatNumber(children, 'token.compact')}
    </Typography>
  </WithSkeleton>
)
