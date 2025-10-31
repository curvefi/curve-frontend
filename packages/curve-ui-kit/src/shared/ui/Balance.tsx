import type { ReactNode } from 'react'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { type Amount, formatNumber, type SxProps } from '@ui-kit/utils'
import { WithWrapper } from './WithWrapper'

const { Spacing, IconSize } = SizesAndSpaces

type BalanceButtonProps = {
  children: ReactNode
  onClick?: () => void
  loading?: boolean
  disabled?: boolean
  testId?: string
}

/** Button wrapper for clickable balance text */
const BalanceButton = ({ children, onClick, loading, disabled, testId }: BalanceButtonProps) => (
  <Button
    variant="inline"
    color="ghost"
    size="extraSmall"
    onClick={onClick}
    loading={loading}
    disabled={disabled}
    data-testid={testId}
    sx={{ '&:hover .balance': { textDecoration: 'underline' } }}
  >
    {children}
  </Button>
)

type BalanceTextProps<T> = {
  symbol: string
  balance?: T
  loading?: boolean
}

const BalanceText = <T extends Amount>({ symbol, balance, loading = false }: BalanceTextProps<T>) => (
  <WithSkeleton loading={loading}>
    <Tooltip title={t`Wallet balance`} body={[balance?.toString() ?? '-', symbol].join(' ')} clickable>
      <Stack direction="row" gap={Spacing.xs} alignItems="center">
        <Typography
          className="balance"
          variant="highlightXs"
          color={balance != null ? 'textPrimary' : 'textTertiary'}
          data-testid="balance-value"
        >
          {balance == null ? '-' : formatNumber(balance, { abbreviate: true })}
        </Typography>

        <Typography variant="highlightXs" color="textPrimary">
          {symbol}
        </Typography>
      </Stack>
    </Tooltip>
  </WithSkeleton>
)

/** Props for the Balance component */
export type Props<T> = {
  /** The token symbol to display */
  symbol: string
  /** Whether the balance is clickable or not */
  clickable?: boolean
  /** The token balance amount (optional, in case of loading) */
  balance?: T
  /** The USD value of the balance (optional) */
  notionalValueUsd?: T | number
  /** Whether to hide the wallet icon */
  hideIcon?: boolean
  /** Whether the balance is loading */
  loading?: boolean
  /** Whether the clickable balance is disabled (something might be loading?) */
  disabled?: boolean
  sx?: SxProps
  /** Optional test ID for the clickable balance button */
  clickTestId?: string
  /** Callback function when balance is clicked (if enabled). */
  onClick?: () => void
}

export const Balance = <T extends Amount>({
  symbol,
  clickable,
  loading = false,
  balance,
  notionalValueUsd,
  hideIcon,
  sx,
  onClick,
  disabled,
  clickTestId,
}: Props<T>) => (
  <Stack direction="row" gap={Spacing.xs} alignItems="center" sx={sx}>
    {!hideIcon && <AccountBalanceWalletOutlinedIcon sx={{ width: IconSize.xs, height: IconSize.xs }} />}

    <WithWrapper
      Wrapper={BalanceButton}
      wrap={clickable && balance != null}
      onClick={onClick}
      disabled={disabled}
      testId={clickTestId}
    >
      <BalanceText symbol={symbol} balance={balance} loading={loading} />
    </WithWrapper>

    {notionalValueUsd != null && !loading && (
      <Typography variant="bodyXsRegular" color="textTertiary">
        {formatNumber(notionalValueUsd, { unit: 'dollar', abbreviate: true })}
      </Typography>
    )}
  </Stack>
)
