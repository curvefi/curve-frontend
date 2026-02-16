import { UserState } from '@/llamalend/queries/user-state.query'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { combineQueryState } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo, ActionInfoGasEstimate, type TxGasInfo } from '@ui-kit/shared/ui/ActionInfo'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import type { Query } from '@ui-kit/types/util'
import { type Decimal, formatNumber, formatPercent } from '@ui-kit/utils'
import { SlippageToleranceActionInfoPure } from '@ui-kit/widgets/SlippageSettings'
import { getHealthValueColor } from '../../features/market-position-details/utils'
import { ActionInfoCollapse } from './ActionInfoCollapse'
import { formatAmount, formatLeverage, INHERIT_GAP } from './info-actions.helpers'

export type LoanActionInfoListProps = {
  isOpen: boolean
  isApproved?: Query<boolean>
  health: Query<Decimal | null>
  prevHealth?: Query<Decimal>
  isFullRepay?: boolean
  prices?: Query<readonly Decimal[]>
  rates: Query<{ borrowApr?: Decimal } | null>
  prevRates?: Query<{ borrowApr?: Decimal } | null>
  loanToValue: Query<Decimal | null>
  prevLoanToValue?: Query<Decimal | null>
  netBorrowApr?: Query<Decimal | null>
  gas: Query<TxGasInfo | null>
  debt?: Query<{ value: Decimal; tokenSymbol: string | undefined } | null>
  collateral?: Query<{ value: Decimal; tokenSymbol: string | undefined } | null>
  /** userState values are used as prev values if collateral or debt are available */
  userState?: Query<UserState>
  prevLeverageValue?: Query<Decimal | null>
  leverageValue?: Query<Decimal | null>
  prevLeverageCollateral?: Query<Decimal | null>
  leverageCollateral?: Query<Decimal | null>
  prevLeverageTotalCollateral?: Query<Decimal | null>
  leverageTotalCollateral?: Query<Decimal | null>
  priceImpact?: Query<number | null>
  slippage?: Decimal
  onSlippageChange?: (newSlippage: Decimal) => void
  collateralSymbol?: string
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
  loanToValue,
  prevLoanToValue,
  netBorrowApr,
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
  leverageEnabled,
}: LoanActionInfoListProps) => {
  const prevDebt = userState?.data?.debt
  const prevCollateral = userState?.data?.collateral
  const isHighImpact = priceImpact?.data != null && slippage != null && priceImpact.data > Number(slippage)
  const theme = useTheme()

  const renderDebtActionInfo = () =>
    (debt || prevDebt) && (
      <ActionInfo
        label={t`Debt`}
        value={debt?.data && formatNumber(debt.data.value, { abbreviate: false })}
        prevValue={prevDebt && formatNumber(prevDebt, { abbreviate: false })}
        {...combineQueryState(debt, userState)}
        valueRight={debt?.data?.tokenSymbol}
        testId="borrow-debt"
      />
    )
  return (
    <ActionInfoCollapse isOpen={isOpen} testId="loan-info-accordion">
      <Stack sx={{ ...INHERIT_GAP }}>
        <Stack>
          <ActionInfo
            label={t`Borrow APR`}
            value={rates.data?.borrowApr && formatPercent(rates.data.borrowApr)}
            prevValue={prevRates?.data?.borrowApr && formatPercent(prevRates.data.borrowApr)}
            {...combineQueryState(rates, prevRates)}
            testId="borrow-apr"
          />
          {netBorrowApr && (
            <ActionInfo
              label={t`Net borrow APR`}
              value={netBorrowApr.data && formatPercent(netBorrowApr.data)}
              {...combineQueryState(netBorrowApr)}
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
              health: health.data,
              prevHealth: prevHealth?.data,
              theme,
              isFullRepay,
            })}
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
              testId="borrow-collateral"
            />
          )}
          {!leverageEnabled && renderDebtActionInfo()}
        </Stack>
      </Stack>

      {leverageEnabled && (
        <Stack sx={{ ...INHERIT_GAP }}>
          {(prevLeverageValue || leverageValue) && (
            <ActionInfo
              label={t`Leverage`}
              value={formatLeverage(leverageValue?.data ?? prevLeverageValue?.data)}
              prevValue={leverageValue?.data && prevLeverageValue?.data && formatLeverage(prevLeverageValue.data)}
              {...combineQueryState(leverageValue, prevLeverageValue)}
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
              testId="borrow-leverage-total-collateral"
            />
          )}
          {renderDebtActionInfo()}
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
            testId="borrow-price-impact"
          />
        )}
        <ActionInfoGasEstimate gas={gas} isApproved={isApproved?.data} />
      </Stack>
    </ActionInfoCollapse>
  )
}
