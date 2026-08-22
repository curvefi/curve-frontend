import type { SvgIcon } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { Amount } from '@primitives/decimal.utils'
import { maybe, maybes } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { BalanceAmount } from '@ui-kit/shared/ui/LargeTokenInput/BalanceAmount'
import { BalanceButton } from '@ui-kit/shared/ui/LargeTokenInput/BalanceButton'
import { VERTICAL_CENTER_TEXT } from '@ui-kit/shared/ui/LargeTokenInput/large-token-input.utils'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { type QueryOrValue, toQuery, toValue } from '@ui-kit/types/util'
import { formatNumber } from '@ui-kit/utils'
import { WalletIcon } from '../../icons/WalletIcon'
import { WithWrapper } from '../WithWrapper'

const { Spacing, LargeTokenInput } = SizesAndSpaces

/** Props for the Balance component */
export type Props<T> = {
  /** The token symbol to display */
  symbol: string | undefined
  /** The token balance amount */
  balance?: QueryOrValue<T>
  /** The USD price of the token (optional, only used when notionalValueUsd is omitted) */
  usdRate?: QueryOrValue<number>
  /** The USD value of the balance (optional, replaces the calculated value with usdRate) */
  notionalValueUsd?: QueryOrValue<T | number>
  /** Prefix before balance. SvgIcon (defaults to wallet icon), string for label, or null for nothing */
  prefix?: string | typeof SvgIcon | null
  /** Custom tooltip title, defaults to 'Wallet balance' which is most this component's use cases */
  tooltip?: string
  /** Whether the clickable balance is disabled (something might be loading?) */
  disabled?: boolean
  /** Optional test ID for the clickable balance button */
  buttonTestId?: string
  /** Callback function when balance is clicked (if enabled). */
  onClick?: () => void
  /** Whether the balance should be displayed inline */
  inline?: boolean
}

export const Balance = <T extends Amount>({
  symbol = '?',
  balance: balanceProp,
  usdRate: usdRateProp,
  notionalValueUsd: notionalValueUsdProp,
  prefix: Prefix = WalletIcon,
  tooltip,
  onClick,
  disabled = false,
  buttonTestId,
  inline = false,
}: Props<T>) => {
  const { data: balance, isLoading: loading } = toQuery(balanceProp)
  const usdRate = toValue(usdRateProp)
  const notionalValueUsd =
    maybe(notionalValueUsdProp, toValue) ?? maybes([balance, usdRate], (usdRate, balance) => +usdRate * +balance)
  return (
    <WithWrapper
      Wrapper={BalanceButton}
      shouldWrap={onClick && balance != null && !loading}
      onClick={onClick}
      disabled={disabled}
      testId={buttonTestId}
    >
      <Tooltip title={tooltip ?? t`Wallet balance`} body={[balance?.toString() ?? '-', symbol].join(' ')} clickable>
        <Box {...(!inline && { sx: { display: 'flex', alignItems: 'center', gap: Spacing.xs } })}>
          {typeof Prefix === 'string' ? (
            <Typography
              variant="bodyXsRegular"
              sx={{ color: t => t.design.Inputs.Text.MetaSubtle }}
              {...(inline && { component: 'span' })}
            >
              {Prefix}
            </Typography>
          ) : (
            Prefix && (
              <Prefix
                sx={{
                  width: LargeTokenInput.BalanceIconSize,
                  height: LargeTokenInput.BalanceIconSize,
                  color: t => t.design.Inputs.Text.Meta,
                  ...(disabled && { color: t => t.design.Inputs.Text.Disabled }),
                }}
              />
            )
          )}{' '}
          <BalanceAmount disabled={disabled} loading={loading} sx={{ ...(inline && { display: 'inline' }) }}>
            {balance}
          </BalanceAmount>{' '}
          <Typography
            variant="highlightXs"
            sx={{
              ...VERTICAL_CENTER_TEXT,
              color: t => t.design.Inputs.Text[disabled ? 'Disabled' : 'Unit'],
            }}
            {...(inline && { component: 'span' })}
          >
            {symbol}
          </Typography>{' '}
          {!!Number(notionalValueUsd) && !loading && (
            <Typography
              variant="bodyXsRegular"
              sx={{ ...VERTICAL_CENTER_TEXT, color: t => t.design.Inputs.Text.MetaSubtle }}
              {...(inline && { component: 'span' })}
            >
              {formatNumber(notionalValueUsd, 'usd.notional')}
            </Typography>
          )}{' '}
        </Box>
      </Tooltip>
    </WithWrapper>
  )
}
