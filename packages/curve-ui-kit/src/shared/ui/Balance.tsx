import type { ReactNode } from 'react'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import type { SvgIcon } from '@mui/material'
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

/**
 * The following property is required on all typography to properly vertically align it with the icon.
 * I haven't been able to find a different solution to this re-occuring problem in other components too,
 * other than resetting the default line-height. Perhaps the default line-heigt works for most use-cases,
 * but it breaks down when you're trying to align things pixel-perfectly in smaller spaces.
 */
const CENTER_TEXT = {
  '&': { lineHeight: '1rem' },
} as const

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
  disabled?: boolean
  balance?: T
  loading?: boolean
}

const BalanceText = <T extends Amount>({ symbol, balance, disabled = false, loading = false }: BalanceTextProps<T>) => (
  <WithSkeleton loading={loading}>
    <Tooltip title={t`Wallet balance`} body={[balance?.toString() ?? '-', symbol].join(' ')} clickable>
      <Stack direction="row" gap={Spacing.xs} alignItems="center">
        <Typography
          className="balance"
          variant="highlightXs"
          color={disabled ? 'textDisabled' : balance == null ? 'textTertiary' : 'textPrimary'}
          data-testid="balance-value"
          sx={CENTER_TEXT}
        >
          {balance == null ? '-' : formatNumber(balance, { abbreviate: true })}
        </Typography>

        <Typography variant="highlightXs" color={disabled ? 'textDisabled' : 'textPrimary'} sx={CENTER_TEXT}>
          {symbol}
        </Typography>
      </Stack>
    </Tooltip>
  </WithSkeleton>
)

/** Props for the Balance component */
export type Props<T> = {
  /** The token symbol to display */
  symbol: string | undefined
  /** Whether the balance is clickable or not */
  clickable?: boolean
  /** The token balance amount (optional, in case of loading) */
  balance?: T
  /** The USD price of the token (optional, only used when notionalValueUsd is omitted) */
  usdRate?: number
  /** The USD value of the balance (optional, replaces the calculated value with usdRate) */
  notionalValueUsd?: T | number
  /** Prefix before balance: ReactNode (defaults to wallet icon), string for label, or null for nothing */
  prefix?: string | typeof SvgIcon | null
  /** Whether the balance is loading */
  loading?: boolean
  /** Whether the clickable balance is disabled (something might be loading?) */
  disabled?: boolean
  sx?: SxProps
  /** Optional test ID for the clickable balance button */
  buttonTestId?: string
  /** Callback function when balance is clicked (if enabled). */
  onClick?: () => void
}

export const Balance = <T extends Amount>({
  symbol = '-',
  clickable,
  balance,
  loading = balance == null,
  usdRate,
  notionalValueUsd = balance && usdRate && usdRate * +balance,
  prefix: Prefix = AccountBalanceWalletOutlinedIcon,
  sx,
  onClick,
  disabled,
  buttonTestId,
}: Props<T>) => (
  <Stack direction="row" gap={Spacing.xs} alignItems="stretch" sx={sx}>
    {typeof Prefix === 'string' ? (
      <Typography variant="bodyXsRegular" color="textTertiary" sx={CENTER_TEXT}>
        {Prefix}
      </Typography>
    ) : (
      Prefix !== null && (
        <Prefix
          sx={{
            width: IconSize.xs,
            height: IconSize.xs,
            ...(disabled && { color: (t) => t.palette.text.disabled }),
          }}
        />
      )
    )}

    <WithWrapper
      Wrapper={BalanceButton}
      shouldWrap={clickable && balance != null}
      onClick={onClick}
      disabled={disabled}
      testId={buttonTestId}
    >
      <BalanceText symbol={symbol} balance={balance} disabled={disabled} loading={loading} />
    </WithWrapper>

    {notionalValueUsd != null && !loading && (
      <Typography variant="bodyXsRegular" color="textTertiary" sx={CENTER_TEXT}>
        {formatNumber(notionalValueUsd, { unit: 'dollar', abbreviate: true })}
      </Typography>
    )}
  </Stack>
)
