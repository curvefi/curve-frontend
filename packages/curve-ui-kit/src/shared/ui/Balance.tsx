import type { ReactNode } from 'react'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { SxProps } from '@ui-kit/utils'

const { Spacing, IconSize } = SizesAndSpaces

const formatNumber = (value?: number): string => {
  if (value == null) return '?'
  if (value === 0) return '0'

  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

type MaxButtonProps = {
  children: ReactNode
  underline: boolean
  sx?: SxProps
  onClick?: () => void
  loading?: boolean
}

/** Reusable Max button component with consistent styling */
const MaxButton = ({ children, underline, sx, onClick, loading }: MaxButtonProps) => (
  <Button
    variant="inline"
    color="ghost"
    size="extraSmall"
    onClick={onClick}
    loading={loading}
    sx={{
      /**
       * Remove any properties that cause the total height component to change
       * depending on the value of the 'max' property of BalanceText.
       * Under normal circumstances, we want the ghost link to have a bit of
       * white space and thus breathing room. However in this case we want the
       * link to be embedded into the typography and be as compact as possible.
       */
      ...(underline && {
        '&:hover .balance': {
          textDecoration: 'underline',
        },
      }),
      // Scale down the loading indicator to fit better with the extraSmall text
      '.MuiButton-loadingIndicator svg': { transform: 'scale(0.5)' },
      ...sx,
    }}
  >
    {children}
  </Button>
)

type BalanceTextProps = {
  symbol: string
  balance?: number
  loading?: boolean
}

const BalanceText = ({ symbol, balance, loading = false }: BalanceTextProps) => (
  <WithSkeleton loading={loading}>
    <Stack direction="row" gap={Spacing.xs} alignItems="center">
      <Typography className="balance" variant="highlightS" color={balance != null ? 'textPrimary' : 'textTertiary'}>
        {formatNumber(balance)}
      </Typography>

      <Typography variant="highlightS" color="textPrimary">
        {symbol}
      </Typography>
    </Stack>
  </WithSkeleton>
)

/**
 * Props for the Balance component
 */
export type Props = {
  /** The token symbol to display */
  symbol: string
  /** Controls how the max value is displayed:
   * - 'balance': Shows the balance as a clickable link
   * - 'button': Shows a separate 'Max' button
   * - 'off': No max functionality is shown
   */
  max: 'balance' | 'button' | 'off'
  /** The token balance amount (optional, in case of loading) */
  balance?: number
  /** The USD value of the balance (optional) */
  notionalValue?: number
  /** Whether to hide the wallet icon */
  hideIcon?: boolean
  sx?: SxProps
  /** Callback function when max button/balance is clicked */
  onMax?: (maxValue: number) => void
  /** Whether the balance is loading */
  loading?: boolean
}

export const Balance = ({ symbol, max, loading = false, balance, notionalValue, hideIcon, sx, onMax }: Props) => (
  <Stack direction="row" gap={Spacing.xs} alignItems="center" sx={sx}>
    {!hideIcon && <AccountBalanceWalletOutlinedIcon sx={{ width: IconSize.sm, height: IconSize.sm }} />}

    {max === 'balance' && balance != null ? (
      <MaxButton underline={true} onClick={() => onMax?.(balance)} loading={loading}>
        <BalanceText symbol={symbol} balance={balance} loading={loading} />
      </MaxButton>
    ) : (
      <BalanceText symbol={symbol} balance={balance} loading={loading} />
    )}

    {notionalValue && (
      <WithSkeleton loading={loading}>
        <Typography variant="bodySRegular" color="textTertiary">
          ${formatNumber(notionalValue)}
        </Typography>
      </WithSkeleton>
    )}

    {max === 'button' && balance != null && (
      <MaxButton
        loading={loading}
        underline={false}
        onClick={() => onMax?.(balance)}
        // Right-align without flex grow for precise click area
        sx={{ marginLeft: 'auto' }}
      >
        Max
      </MaxButton>
    )}
  </Stack>
)
