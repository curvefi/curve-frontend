import type { SvgIcon } from '@mui/material'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { Amount } from '@primitives/decimal.utils'
import { formatNumber, PLACEHOLDER_USD, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { ErrorIconButton } from '@ui/components/ErrorIconButton'
import { Tooltip } from '@ui/components/Tooltip'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import { WithWrapper } from '@ui/components/WithWrapper'
import { BalanceAmount } from '@ui/features/forms/controls/LargeTokenInput/BalanceAmount'
import { BalanceButton } from '@ui/features/forms/controls/LargeTokenInput/BalanceButton'
import { VERTICAL_CENTER_TEXT } from '@ui/features/forms/controls/LargeTokenInput/large-token-input.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { type QueryOrValue, toQuery } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { WalletIcon } from '@ui/icons/WalletIcon'
import { t } from '@ui/lib/i18n'

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
  const { data: balance, isLoading, error } = toQuery(balanceProp)
  const { data: notionalValueUsd, isLoading: notionalLoading } = toQuery(
    notionalValueUsdProp ??
      combineQueries([toQuery(balanceProp), toQuery(usdRateProp)], (balance, rate) => +balance * rate),
  )
  return (
    <WithWrapper
      Wrapper={BalanceButton}
      shouldWrap={onClick && balance != null && !isLoading && !error}
      onClick={onClick}
      disabled={disabled}
      testId={buttonTestId}
    >
      <WithWrapper
        Wrapper={Tooltip}
        shouldWrap={!error}
        title={tooltip ?? t`Wallet balance`}
        body={[balance ?? UNAVAILABLE_NOTATION, symbol].join(' ')}
        clickable
      >
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
          {error && <ErrorIconButton error={error} size="extraExtraSmall" />}
          <BalanceAmount disabled={disabled} loading={isLoading} sx={{ ...(inline && { display: 'inline' }) }}>
            {balance}
          </BalanceAmount>{' '}
          <Typography
            variant="highlightXs"
            sx={{ ...VERTICAL_CENTER_TEXT, color: t => t.design.Inputs.Text[disabled ? 'Disabled' : 'Unit'] }}
            {...(inline && { component: 'span' })}
          >
            {symbol}
          </Typography>{' '}
          {!isLoading && (notionalLoading || !!Number(notionalValueUsd)) && (
            <WithSkeleton loading={notionalLoading} component={inline ? 'span' : 'div'}>
              <Typography
                variant="bodyXsRegular"
                sx={{ ...VERTICAL_CENTER_TEXT, color: t => t.design.Inputs.Text.MetaSubtle }}
                {...(inline && { component: 'span' })}
              >
                {formatNumber(notionalLoading ? PLACEHOLDER_USD : notionalValueUsd, 'usd.notional')}
              </Typography>
            </WithSkeleton>
          )}{' '}
        </Box>
      </WithWrapper>
    </WithWrapper>
  )
}
