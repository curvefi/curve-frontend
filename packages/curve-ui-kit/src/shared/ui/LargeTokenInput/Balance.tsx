import type { SvgIcon } from '@mui/material'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { BalanceAmount } from '@ui-kit/shared/ui/LargeTokenInput/BalanceAmount'
import { BalanceButton } from '@ui-kit/shared/ui/LargeTokenInput/BalanceButton'
import { VERTICAL_CENTER_TEXT } from '@ui-kit/shared/ui/LargeTokenInput/large-token-input.utils'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { type Amount, formatNumber } from '@ui-kit/utils'
import { WalletIcon } from '../../icons/WalletIcon'
import { WithWrapper } from '../WithWrapper'

const { Spacing, IconSize } = SizesAndSpaces

/** Props for the Balance component */
export type Props<T> = {
  /** The token symbol to display */
  symbol: string | undefined
  /** The token balance amount (optional, in case of loading) */
  balance?: T
  /** The USD price of the token (optional, only used when notionalValueUsd is omitted) */
  usdRate?: number
  /** The USD value of the balance (optional, replaces the calculated value with usdRate) */
  notionalValueUsd?: T | number
  /** Prefix before balance. SvgIcon (defaults to wallet icon), string for label, or null for nothing */
  prefix?: string | typeof SvgIcon | null
  /** Custom tooltip title, defaults to 'Wallet balance' which is most this component's use cases */
  tooltip?: string
  /** Whether the balance is loading */
  loading?: boolean
  /** Whether the clickable balance is disabled (something might be loading?) */
  disabled?: boolean
  /** Optional test ID for the clickable balance button */
  buttonTestId?: string
  /** Callback function when balance is clicked (if enabled). */
  onClick?: () => void
}

export const Balance = <T extends Amount>({
  symbol = '?',
  balance,
  loading = balance == null,
  usdRate,
  notionalValueUsd = balance && usdRate && usdRate * +balance,
  prefix: Prefix = WalletIcon,
  tooltip,
  onClick,
  disabled = false,
  buttonTestId,
}: Props<T>) => (
  <WithWrapper
    Wrapper={BalanceButton}
    shouldWrap={onClick && balance != null && !loading}
    onClick={onClick}
    disabled={disabled}
    testId={buttonTestId}
  >
    <Tooltip title={tooltip ?? t`Wallet balance`} body={[balance?.toString() ?? '-', symbol].join(' ')} clickable>
      <Stack direction="row" gap={Spacing.xs} alignItems="center">
        {typeof Prefix === 'string' ? (
          <Typography variant="bodyXsRegular" color="textTertiary">
            {Prefix}
          </Typography>
        ) : (
          Prefix && (
            <Prefix
              sx={{
                width: IconSize.sm,
                height: IconSize.sm,
                color: (t) => t.palette.text.primary,
                ...(disabled && { color: (t) => t.palette.text.disabled }),
              }}
            />
          )
        )}

        <BalanceAmount disabled={disabled} loading={loading}>
          {balance}
        </BalanceAmount>

        <Typography
          variant="highlightXs"
          color={disabled ? 'textDisabled' : 'textPrimary'}
          sx={{ ...VERTICAL_CENTER_TEXT }}
        >
          {symbol}
        </Typography>

        {notionalValueUsd != null && !loading && (
          <Typography variant="bodyXsRegular" color="textTertiary" sx={{ ...VERTICAL_CENTER_TEXT }}>
            {formatNumber(notionalValueUsd, { unit: 'dollar', abbreviate: true })}
          </Typography>
        )}
      </Stack>
    </Tooltip>
  </WithWrapper>
)
