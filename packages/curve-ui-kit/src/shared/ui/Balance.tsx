import type { ReactNode } from 'react'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber, SxProps } from '@ui-kit/utils'

const { Spacing, IconSize } = SizesAndSpaces

type MaxButtonProps = {
  children: ReactNode
  underline?: boolean
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
       * white space and thus breathing room. However, in this case we want the
       * link to be embedded into the typography and be as compact as possible.
       */
      ...(underline && {
        '&:hover .balance': {
          textDecoration: 'underline',
        },
      }),
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
      <Typography
        className="balance"
        variant="highlightS"
        color={balance != null ? 'textPrimary' : 'textTertiary'}
        data-testid="balance-value"
      >
        {balance == null ? '-' : formatNumber(balance, { abbreviate: true })}
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
  notionalValueUsd?: number
  /** Whether to hide the wallet icon */
  hideIcon?: boolean
  sx?: SxProps
  /** Callback function when max button/balance is clicked */
  onMax?: () => void
  /** Whether the balance is loading */
  loading?: boolean
}

export const Balance = ({ symbol, max, loading = false, balance, notionalValueUsd, hideIcon, sx, onMax }: Props) => (
  <Stack direction="row" gap={Spacing.xs} alignItems="center" sx={sx}>
    {!hideIcon && <AccountBalanceWalletOutlinedIcon sx={{ width: IconSize.sm, height: IconSize.sm }} />}

    {max === 'balance' && balance != null ? (
      <MaxButton underline onClick={onMax} loading={loading}>
        <BalanceText symbol={symbol} balance={balance} loading={loading} />
      </MaxButton>
    ) : (
      <BalanceText symbol={symbol} balance={balance} loading={loading} />
    )}

    {notionalValueUsd != null && !loading && (
      <Typography variant="bodySRegular" color="textTertiary">
        {formatNumber(notionalValueUsd, { unit: 'dollar', abbreviate: true })}
      </Typography>
    )}

    {max === 'button' && balance != null && (
      // Right-align without flex grow for precise click area
      <MaxButton loading={loading} onClick={onMax} sx={{ marginLeft: 'auto' }}>
        {t`Max`}
      </MaxButton>
    )}
  </Stack>
)
