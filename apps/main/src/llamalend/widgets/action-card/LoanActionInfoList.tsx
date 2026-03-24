import { getHealthValueColor } from '@/llamalend/features/market-position-details'
import type { MarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { Decimal } from '@primitives/decimal.utils'
import { notFalsy } from '@primitives/objects.utils'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo, ActionInfoGasEstimate, type TxGasInfo } from '@ui-kit/shared/ui/ActionInfo'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import type { QueryProp, Range } from '@ui-kit/types/util'
import { decimal, formatNumber, formatPercent } from '@ui-kit/utils'
import { RouteProvidersAccordion } from '@ui-kit/widgets/RouteProvider'
import { SlippageToleranceActionInfoPure } from '@ui-kit/widgets/SlippageSettings'
import { ActionInfoCollapse } from './ActionInfoCollapse'
import {
  ACTION_INFO_GROUP_SX,
  combineActionInfoState,
  formatAmount,
  formatLeverage,
  isQueryValueNotEqual,
} from './info-actions.helpers'

export type LoanActionInfoListProps = {
  isOpen?: boolean
  isApproved?: QueryProp<boolean>
  health?: QueryProp<Decimal | null>
  prevHealth?: QueryProp<Decimal | null>
  isFullRepay?: boolean
  prices?: QueryProp<Range<Decimal>>
  prevPrices?: QueryProp<Range<Decimal>>
  rates?: QueryProp<{ borrowApr?: Decimal } | null>
  prevRates?: QueryProp<{ borrowApr?: Decimal } | null>
  exchangeRate?: QueryProp<Decimal | null>
  loanToValue?: QueryProp<Decimal | null>
  prevLoanToValue?: QueryProp<Decimal | null>
  prevNetBorrowApr?: QueryProp<Decimal | null>
  netBorrowApr?: QueryProp<Decimal | null>
  gas: QueryProp<TxGasInfo | null>
  prevDebt?: QueryProp<Decimal | null>
  debt?: QueryProp<{ value: Decimal | null; tokenSymbol: string | undefined } | null>
  prevCollateral?: QueryProp<Decimal | null>
  collateral?: QueryProp<{ value: Decimal | null; tokenSymbol: string | undefined } | null>
  prevLeverageValue?: QueryProp<Decimal | null>
  leverageValue?: QueryProp<Decimal | null>
  prevLeverageCollateral?: QueryProp<Decimal | null>
  leverageCollateral?: QueryProp<Decimal | null>
  prevLeverageTotalCollateral?: QueryProp<Decimal | null>
  leverageTotalCollateral?: QueryProp<Decimal | null>
  priceImpact?: QueryProp<number | null>
  slippage?: Decimal
  onSlippageChange?: (newSlippage: Decimal) => void
  collateralSymbol?: string
  borrowSymbol?: string
  /** Whether to show leverage-related fields (leverage value, leverage collateral...) */
  leverageEnabled?: boolean
  routes?: MarketRoutes
}

/**
 * List with action infos about the loan (like health, borrow APR, LTV, net borrow APR, estimated gas, slippage)
 * By default, the action info are hidden. They are visible when the isOpen prop is true.
 * When leverage is enabled, leverage-specific infos and slippage settings are also included.
 */
export const LoanActionInfoList = ({
  isOpen,
  isApproved,
  health,
  prevHealth,
  isFullRepay,
  prices,
  prevPrices,
  prevRates,
  rates,
  exchangeRate,
  loanToValue,
  prevLoanToValue,
  netBorrowApr,
  prevNetBorrowApr,
  gas,
  debt,
  prevDebt,
  collateral,
  prevCollateral,
  prevLeverageValue,
  leverageValue,
  prevLeverageCollateral,
  leverageCollateral,
  prevLeverageTotalCollateral,
  leverageTotalCollateral,
  priceImpact,
  slippage,
  onSlippageChange,
  collateralSymbol,
  borrowSymbol,
  leverageEnabled,
  routes,
}: LoanActionInfoListProps) => {
  const [isRoutesOpen, , , toggleRoutes] = useSwitch(false)
  const isHighImpact = priceImpact?.data != null && slippage != null && priceImpact.data > Number(slippage)
  const exchangeRateValue = decimal(exchangeRate?.data)
  const shouldShowprevNetBorrowApr = isQueryValueNotEqual(prevNetBorrowApr, prevRates?.data?.borrowApr)
  const shouldShowNetBorrowApr = isQueryValueNotEqual(netBorrowApr, rates?.data?.borrowApr)
  console.log({
    loanToValue,
    prevLoanToValue,
  })

  const debtActionInfo = (debt || prevDebt) && (
    <ActionInfo
      label={t`Debt`}
      value={debt?.data?.value && formatNumber(debt.data.value, { abbreviate: false })}
      prevValue={prevDebt?.data && formatNumber(prevDebt.data, { abbreviate: false })}
      {...combineActionInfoState(debt, prevDebt)}
      valueRight={debt?.data?.tokenSymbol}
      size="small"
      testId="borrow-debt"
    />
  )
  return (
    <ActionInfoCollapse isOpen={isOpen} testId="loan-action-info-list">
      <Stack sx={{ ...ACTION_INFO_GROUP_SX }}>
        <Stack>
          {(rates || prevRates) && (
            <ActionInfo
              label={t`Borrow APR`}
              value={rates?.data?.borrowApr && formatPercent(rates.data.borrowApr)}
              prevValue={prevRates?.data?.borrowApr && formatPercent(prevRates.data.borrowApr)}
              {...combineActionInfoState(rates, prevRates)}
              size="small"
              testId="borrow-apr"
            />
          )}
          {(shouldShowNetBorrowApr || shouldShowprevNetBorrowApr) && (
            <ActionInfo
              label={t`Net borrow APR`}
              value={netBorrowApr?.data && formatPercent(netBorrowApr.data)}
              prevValue={prevNetBorrowApr?.data && formatPercent(prevNetBorrowApr.data)}
              {...combineActionInfoState(netBorrowApr, prevNetBorrowApr)}
              size="small"
              testId="borrow-net-apr"
            />
          )}
        </Stack>
        <Stack>
          <ActionInfo
            label={t`Health`}
            value={health?.data && !isFullRepay ? formatNumber(health.data, { abbreviate: false }) : '∞'}
            {...(prevHealth && {
              prevValue: prevHealth.data ? formatNumber(prevHealth.data, { abbreviate: false }) : '∞',
            })}
            emptyValue="∞"
            {...combineActionInfoState(health, prevHealth)}
            valueColor={getHealthValueColor({
              health: health?.data,
              prevHealth: prevHealth?.data,
              theme: useTheme(),
              isFullRepay,
            })}
            size="small"
            testId="borrow-health"
          />
          {(loanToValue || prevLoanToValue) && (
            <ActionInfo
              label={
                <Tooltip title={t`Loan to value ratio`} placement="top">
                  <span>{t`LTV`}</span>
                </Tooltip>
              }
              value={loanToValue?.data && formatPercent(loanToValue.data)}
              prevValue={prevLoanToValue?.data && formatPercent(prevLoanToValue.data)}
              {...combineActionInfoState(loanToValue, prevLoanToValue)}
              size="small"
              testId="borrow-ltv"
            />
          )}
          {(prices || prevPrices) && !isFullRepay && (
            <ActionInfo
              label={t`Liquidation zone`}
              value={prices?.data?.map((p) => formatNumber(p, { abbreviate: false })).join(' - ')}
              prevValue={prevPrices?.data?.map((p) => formatNumber(p, { abbreviate: false })).join(' - ')}
              valueRight={notFalsy(collateralSymbol, borrowSymbol).join('/')}
              {...combineActionInfoState(prices, prevPrices)}
              size="small"
              alignItems="start"
              testId="borrow-price-range"
            />
          )}
        </Stack>
        <Stack>
          {(collateral || prevCollateral) && (
            <ActionInfo
              label={t`Collateral`}
              value={
                isFullRepay ? 0 : collateral?.data?.value && formatNumber(collateral.data.value, { abbreviate: false })
              }
              prevValue={prevCollateral?.data && formatNumber(prevCollateral.data, { abbreviate: false })}
              {...combineActionInfoState(collateral, prevCollateral)}
              valueRight={collateral?.data?.tokenSymbol ?? collateralSymbol}
              size="small"
              testId="borrow-collateral"
            />
          )}
          {!leverageEnabled && debtActionInfo}
        </Stack>
      </Stack>

      {leverageEnabled && (
        <Stack data-testid="borrow-leverage-info-list">
          {(prevLeverageValue || leverageValue) && (
            <ActionInfo
              label={t`Leverage`}
              value={formatLeverage(leverageValue?.data ?? prevLeverageValue?.data)}
              prevValue={leverageValue?.data && prevLeverageValue?.data && formatLeverage(prevLeverageValue.data)}
              {...combineActionInfoState(leverageValue, prevLeverageValue)}
              size="small"
              testId="borrow-leverage"
            />
          )}
          {(prevLeverageCollateral || leverageCollateral) && (
            <ActionInfo
              label={t`Leverage collateral`}
              value={formatAmount(leverageCollateral?.data ?? prevLeverageCollateral?.data, collateralSymbol)}
              prevValue={
                leverageCollateral?.data &&
                prevLeverageCollateral?.data &&
                formatAmount(prevLeverageCollateral.data, collateralSymbol)
              }
              {...combineActionInfoState(leverageCollateral, prevLeverageCollateral)}
              size="small"
              testId="borrow-leverage-collateral"
            />
          )}
          {(prevLeverageTotalCollateral || leverageTotalCollateral) && (
            <ActionInfo
              label={t`Total collateral`}
              value={formatAmount(leverageTotalCollateral?.data ?? prevLeverageTotalCollateral?.data, collateralSymbol)}
              prevValue={
                leverageTotalCollateral?.data &&
                prevLeverageTotalCollateral?.data &&
                formatAmount(prevLeverageTotalCollateral.data, collateralSymbol)
              }
              {...combineActionInfoState(leverageTotalCollateral, prevLeverageTotalCollateral)}
              size="small"
              testId="borrow-leverage-total-collateral"
            />
          )}
          {debtActionInfo}
        </Stack>
      )}

      <Stack>
        {slippage && onSlippageChange && (
          <SlippageToleranceActionInfoPure maxSlippage={slippage} onSave={onSlippageChange} size="small" />
        )}
        {priceImpact && (
          <ActionInfo
            label={isHighImpact ? t`High price impact` : t`Price impact`}
            value={priceImpact.data == null ? '-' : formatPercent(priceImpact.data)}
            {...(isHighImpact && { valueColor: 'error' })}
            error={priceImpact.error}
            loading={priceImpact.isLoading}
            size="small"
            testId="borrow-price-impact"
          />
        )}

        {exchangeRate && collateralSymbol && borrowSymbol && (
          <ActionInfo
            label={t`Exchange rate`}
            value={
              exchangeRateValue &&
              `1 ${collateralSymbol} = ${formatNumber(exchangeRateValue, { abbreviate: false })} ${borrowSymbol}`
            }
            error={exchangeRate.error}
            loading={exchangeRate.isLoading}
            size="small"
            testId="borrow-exchange-rate"
          />
        )}
        {routes && <RouteProvidersAccordion isExpanded={isRoutesOpen} onToggle={toggleRoutes} {...routes} />}
        <ActionInfoGasEstimate gas={gas} isApproved={isApproved?.data} />
      </Stack>
    </ActionInfoCollapse>
  )
}
