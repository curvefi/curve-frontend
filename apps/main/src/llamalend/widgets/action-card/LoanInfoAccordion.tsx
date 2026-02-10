import { UserState } from '@/llamalend/queries/user-state.query'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { combineQueryState } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import type { Query } from '@ui-kit/types/util'
import { type Decimal, formatNumber, formatPercent } from '@ui-kit/utils'
import { SlippageToleranceActionInfoPure } from '@ui-kit/widgets/SlippageSettings'
import { getHealthValueColor } from '../../features/market-position-details/utils'
import { ActionInfoAccordion, EstimatedTxCost, TxGasInfo } from './info-accordion.components'
import { formatAmount, formatLeverage } from './info-accordion.helpers'

export type LoanInfoAccordionProps = {
  isOpen: boolean
  toggle: () => void
  range?: number
  isApproved?: Query<boolean>
  health?: Query<Decimal | null>
  prevHealth?: Query<Decimal>
  isFullRepay?: boolean
  bands?: Query<[number, number]>
  prices?: Query<readonly Decimal[]>
  rates: Query<{ borrowApr?: Decimal } | null>
  prevRates?: Query<{ borrowApr?: Decimal } | null>
  loanToValue: Query<Decimal | null>
  prevLoanToValue?: Query<Decimal | null>
  netBorrowApr?: Query<Decimal | null>
  gas: Query<TxGasInfo | null>
  debt?: Query<{ value: Decimal; tokenSymbol: string | undefined } | null>
  collateral?: Query<{ value: Decimal; tokenSymbol: string | undefined } | null>
  // userState values are used as prev values if collateral or debt are available
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

export const LoanInfoAccordion = ({
  isOpen,
  toggle,
  range,
  isApproved,
  health,
  prevHealth,
  isFullRepay,
  bands,
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
}: LoanInfoAccordionProps) => {
  const prevDebt = userState?.data?.debt
  const prevCollateral = userState?.data?.collateral
  const isHighImpact = priceImpact?.data != null && slippage != null && priceImpact.data > Number(slippage)
  return (
    <ActionInfoAccordion
      title={t`Health`}
      info={
        <ActionInfo
          label=""
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
          testId="borrow-health"
        />
      }
      testId="loan-info-accordion"
      expanded={isOpen}
      toggle={toggle}
    >
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
        {(debt || prevDebt) && (
          <ActionInfo
            label={t`Debt`}
            value={debt?.data && formatNumber(debt.data.value, { abbreviate: false })}
            prevValue={prevDebt && formatNumber(prevDebt, { abbreviate: false })}
            {...combineQueryState(debt, userState)}
            valueRight={debt?.data?.tokenSymbol}
            testId="borrow-debt"
          />
        )}
        {isFullRepay && userState && (
          <ActionInfo
            label={t`Withdraw amount`}
            value={
              userState.data && `${formatNumber(userState.data.collateral, { abbreviate: true })} ${collateralSymbol}`
            }
            {...combineQueryState(userState)}
          />
        )}
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
        {bands && !isFullRepay && (
          <ActionInfo
            label={t`Bands`}
            value={bands.data && `${bands.data[0]} to ${bands.data[1]}`}
            error={bands.error}
            loading={bands.isLoading}
            testId="borrow-band-range"
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
        {range != null && (
          <ActionInfo label={t`N`} value={formatNumber(range, { decimals: 0, abbreviate: false })} testId="borrow-n" />
        )}
      </Stack>

      {leverageEnabled && (
        <Stack>
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
        <EstimatedTxCost gas={gas} isApproved={isApproved?.data} />
      </Stack>
    </ActionInfoAccordion>
  )
}
