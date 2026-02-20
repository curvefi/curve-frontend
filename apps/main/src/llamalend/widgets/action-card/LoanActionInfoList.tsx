import { getHealthValueColor } from '@/llamalend/features/market-position-details'
import { UserState } from '@/llamalend/queries/user'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { combineQueryState } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo, ActionInfoGasEstimate, type TxGasInfo } from '@ui-kit/shared/ui/ActionInfo'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import type { QueryProp } from '@ui-kit/types/util'
import { decimal, type Decimal, formatNumber, formatPercent } from '@ui-kit/utils'
import { SlippageToleranceActionInfoPure } from '@ui-kit/widgets/SlippageSettings'
import { ActionInfoCollapse } from './ActionInfoCollapse'
import { formatAmount, formatLeverage, ACTION_INFO_GROUP_SX } from './info-actions.helpers'

export type LoanActionInfoListProps = {
  isOpen?: boolean
  isApproved?: QueryProp<boolean>
  health?: QueryProp<Decimal | null>
  prevHealth?: QueryProp<Decimal>
  isFullRepay?: boolean
  prices?: QueryProp<readonly Decimal[]>
  rates?: QueryProp<{ borrowApr?: Decimal } | null>
  prevRates?: QueryProp<{ borrowApr?: Decimal } | null>
  exchangeRate?: QueryProp<string | null>
  loanToValue?: QueryProp<Decimal | null>
  prevLoanToValue?: QueryProp<Decimal | null>
  prevNetBorrowApr?: QueryProp<Decimal | null>
  netBorrowApr?: QueryProp<Decimal | null>
  gas: QueryProp<TxGasInfo | null>
  debt?: QueryProp<{ value: Decimal; tokenSymbol: string | undefined } | null>
  collateral?: QueryProp<{ value: Decimal; tokenSymbol: string | undefined } | null>
  /** userState values are used as prev values if collateral or debt are available */
  userState?: QueryProp<UserState>
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
  prevRates,
  rates,
  exchangeRate,
  loanToValue,
  prevLoanToValue,
  netBorrowApr,
  prevNetBorrowApr,
  gas,
  debt,
  collateral,
  userState,
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
}: LoanActionInfoListProps) => {
  const prevDebt = userState?.data?.debt
  const prevCollateral = userState?.data?.collateral
  const isHighImpact = priceImpact?.data != null && slippage != null && priceImpact.data > Number(slippage)
  const exchangeRateValue = decimal(exchangeRate?.data)

  const debtActionInfo = (debt || prevDebt) && (
    <ActionInfo
      label={t`Debt`}
      value={debt?.data && formatNumber(debt.data.value, { abbreviate: false })}
      prevValue={prevDebt && formatNumber(prevDebt, { abbreviate: false })}
      {...combineQueryState(debt, userState)}
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
              {...combineQueryState(rates, prevRates)}
              size="small"
              testId="borrow-apr"
            />
          )}
          {(netBorrowApr || prevNetBorrowApr) && (
            <ActionInfo
              label={t`Net borrow APR`}
              value={netBorrowApr?.data && formatPercent(netBorrowApr.data)}
              prevValue={prevNetBorrowApr?.data && formatPercent(prevNetBorrowApr.data)}
              {...combineQueryState(netBorrowApr, prevNetBorrowApr)}
              size="small"
              testId="borrow-net-apr"
            />
          )}
        </Stack>
        <Stack>
          <ActionInfo
            label={t`Health`}
            value={isFullRepay ? '∞' : health?.data && formatNumber(health.data, { abbreviate: false })}
            prevValue={prevHealth?.data && formatNumber(prevHealth.data, { abbreviate: false })}
            emptyValue="∞"
            {...combineQueryState(health, prevHealth)}
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
              {...combineQueryState(loanToValue, prevLoanToValue)}
              size="small"
              testId="borrow-ltv"
            />
          )}
          {prices && !isFullRepay && (
            <ActionInfo
              label={t`Liquidation zone`}
              value={prices.data?.map((p) => formatNumber(p, { abbreviate: false })).join(' - ')}
              valueRight={debt?.data?.tokenSymbol}
              error={prices.error}
              loading={prices.isLoading}
              size="small"
              testId="borrow-price-range"
            />
          )}
        </Stack>
        <Stack>
          {(collateral || prevCollateral) && (
            <ActionInfo
              label={t`Collateral`}
              value={isFullRepay ? 0 : collateral?.data && formatNumber(collateral.data.value, { abbreviate: false })}
              prevValue={prevCollateral && formatNumber(prevCollateral, { abbreviate: false })}
              {...combineQueryState(collateral, userState)}
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
              {...combineQueryState(leverageValue, prevLeverageValue)}
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
              {...combineQueryState(leverageCollateral, prevLeverageCollateral)}
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
              {...combineQueryState(leverageTotalCollateral, prevLeverageTotalCollateral)}
              size="small"
              testId="borrow-leverage-total-collateral"
            />
          )}
          {debtActionInfo}
        </Stack>
      )}

      <Stack>
        {slippage && onSlippageChange && (
          <SlippageToleranceActionInfoPure maxSlippage={slippage} onSave={onSlippageChange} />
        )}
        {priceImpact && (
          <ActionInfo
            label={isHighImpact ? t`High price impact` : t`Price impact`}
            value={formatPercent(priceImpact.data)}
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
              exchangeRateValue != null
                ? `1 ${collateralSymbol} = ${formatNumber(exchangeRateValue, { abbreviate: false })} ${borrowSymbol}`
                : undefined
            }
            error={exchangeRate.error}
            loading={exchangeRate.isLoading}
            size="small"
            testId="borrow-exchange-rate"
          />
        )}
        <ActionInfoGasEstimate gas={gas} isApproved={isApproved?.data} />
      </Stack>
    </ActionInfoCollapse>
  )
}
