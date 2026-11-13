import { BORROW_RATE_TITLE } from '@/llamalend/constants'
import {
  getLegacyHealthValueColor,
  getLeverageValueColor,
} from '@/llamalend/features/market-position-details/market-position-details.utils'
import { HealthTooltipContent } from '@/llamalend/features/market-position-details/tooltips/HealthTooltipContent'
import { LiquidationBufferTooltipContent } from '@/llamalend/features/market-position-details/tooltips/LiquidationBufferTooltipContent'
import { getHealth } from '@/llamalend/health.utils'
import { type BorrowRates, formatReturnOnEquity } from '@/llamalend/rates.utils'
import { ReturnToWalletActionInfo } from '@/llamalend/widgets/action-card/ReturnToWalletActionInfo'
import { SmallLiquidationRangeChart } from '@/llamalend/widgets/small-liquidation-range-chart/SmallLiquidationRangeChart'
import { LoopedAprTooltipContent } from '@/llamalend/widgets/tooltips/LoopedAprTooltipContent'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { Decimal } from '@primitives/decimal.utils'
import { formatNumber, UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { maybe, maybes, notFalsy } from '@primitives/objects.utils'
import { Tooltip } from '@ui/components/Tooltip'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { ActionInfoGasEstimate, type TxGasInfo } from '@ui/features/forms/action-info/ActionInfoGasEstimate'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery, type QueryProp, type Range, DISABLED_Q } from '@ui/features/queries/util'
import { useShowNetRate } from '@ui/features/storage/useLocalStorage'
import { t } from '@ui/lib/i18n'
import { formatCappedRatePercent } from '@ui/lib/rates.utils'
import { ActionInfoCollapse } from './ActionInfoCollapse'
import { useShouldShowNetRate } from './hooks/useShouldShowNetRate'
import { ACTION_INFO_GROUP_SX, formatAmount, formatLeverage } from './info-actions.helpers'

/** The position after the action: its range and buffer, unless the action closes it */
type FuturePositionProps =
  | { isFullRepay?: boolean; prices: QueryProp<Range<Decimal> | null>; liquidationBuffer: QueryProp<Decimal | null> }
  | { isFullRepay: true; prices?: never; liquidationBuffer?: never }

export type LoanActionInfoListProps = FuturePositionProps & {
  isOpen: boolean
  isApproved?: QueryProp<boolean>
  health?: QueryProp<Decimal | null>
  prevHealth?: QueryProp<Decimal | null>
  prevLiquidationBuffer?: QueryProp<Decimal | null>
  prevPrices?: QueryProp<Range<Decimal> | null>
  rates?: QueryProp<BorrowRates | null>
  prevRates?: QueryProp<BorrowRates | null>
  collateralApy?: QueryProp<number | null>
  oraclePrice: QueryProp<Decimal | null>
  loanToValue?: QueryProp<Decimal | null>
  prevLoanToValue?: QueryProp<Decimal | null>
  prevNetBorrowApr?: QueryProp<Decimal | null>
  netBorrowApr?: QueryProp<Decimal | null>
  gas: QueryProp<TxGasInfo | null>
  prevDebt?: QueryProp<Decimal | null>
  debt?: QueryProp<Decimal | null>
  prevCollateral?: QueryProp<Decimal | null>
  collateral?: QueryProp<Decimal | null>
  returnToWallet?: QueryProp<{ value: Decimal; symbol: string }[]>
  prevLeverageValue?: QueryProp<Decimal | null>
  leverageValue?: QueryProp<Decimal | null>
  /** @deprecated Return on equity inputs, collateral leverage path only */
  prevCollateralLeverageValue?: QueryProp<Decimal | null>
  collateralLeverageValue?: QueryProp<Decimal | null>
  prevLoopedApr?: QueryProp<Decimal | null>
  loopedApr?: QueryProp<Decimal | null>
  prevLeverageCollateral?: QueryProp<Decimal | null>
  leverageCollateral?: QueryProp<Decimal | null>
  prevLeverageTotalCollateral?: QueryProp<Decimal | null>
  leverageTotalCollateral?: QueryProp<Decimal | null>
  collateralSymbol?: string
  borrowSymbol?: string
  /** Whether to show leverage-related fields (leverage value, leverage collateral...) */
  leverageEnabled?: boolean
}

const formatHealthQuery = (
  oraclePrice: QueryProp<Decimal | null>,
  prices: QueryProp<Range<Decimal> | null> | undefined,
) =>
  combineQueries([oraclePrice, prices ?? DISABLED_Q], (oraclePrice, prices) =>
    maybes([oraclePrice, prices], (oraclePrice, prices) => formatNumber(getHealth(oraclePrice, prices), 'health')),
  )

/**
 * List with action infos about the loan (like health, borrow APR, LTV, net borrow APR, estimated gas)
 * By default, the action info are hidden. They are visible when the isOpen prop is true.
 * When leverage is enabled, leverage-specific infos are also included.
 */
export const LoanActionInfoList = ({
  isOpen,
  isApproved,
  health,
  prevHealth,
  liquidationBuffer,
  prevLiquidationBuffer,
  isFullRepay,
  prices,
  prevPrices,
  prevRates,
  rates,
  collateralApy,
  oraclePrice,
  loanToValue,
  prevLoanToValue,
  netBorrowApr,
  prevNetBorrowApr,
  gas,
  debt,
  prevDebt,
  collateral,
  prevCollateral,
  returnToWallet,
  prevLeverageValue,
  leverageValue,
  prevCollateralLeverageValue,
  collateralLeverageValue,
  prevLoopedApr,
  loopedApr,
  prevLeverageCollateral,
  leverageCollateral,
  prevLeverageTotalCollateral,
  leverageTotalCollateral,
  collateralSymbol,
  borrowSymbol,
  leverageEnabled,
}: LoanActionInfoListProps) => {
  const theme = useTheme()
  const shouldShowNetBorrowApr = useShouldShowNetRate({
    tokenSymbol: collateralSymbol,
    prevNetRate: prevNetBorrowApr,
    prevRate: prevRates && mapQuery(prevRates, d => d?.borrowApr),
    netRate: netBorrowApr,
    rate: rates && mapQuery(rates, d => d?.borrowApr),
    defaultValue: useShowNetRate('borrow'),
  })

  const debtActionInfo = (
    <>
      {(debt ?? prevDebt) && (
        <ActionInfo
          label={t`Debt`}
          value={mapQuery(prevDebt ?? DISABLED_Q, data => formatNumber(data, { abbreviate: false }))}
          futureValue={mapQuery(debt ?? DISABLED_Q, data => formatNumber(data, { abbreviate: false }))}
          valueRight={borrowSymbol}
          size="small"
          testId="borrow-debt"
        />
      )}
      {returnToWallet && <ReturnToWalletActionInfo returnToWallet={returnToWallet} />}
    </>
  )

  return (
    <ActionInfoCollapse isOpen={isOpen} testId="loan-action-info-list">
      <Stack sx={ACTION_INFO_GROUP_SX}>
        <Stack>
          {(rates ?? prevRates) && (
            <ActionInfo
              label={BORROW_RATE_TITLE}
              value={mapQuery(prevRates ?? DISABLED_Q, data => maybe(data?.borrowApr, formatCappedRatePercent))}
              futureValue={mapQuery(rates ?? DISABLED_Q, data => maybe(data?.borrowApr, formatCappedRatePercent))}
              size="small"
              testId="borrow-apr"
            />
          )}
          {shouldShowNetBorrowApr && (
            <ActionInfo
              label={t`Net borrow APR`}
              value={mapQuery(prevNetBorrowApr ?? DISABLED_Q, data => formatCappedRatePercent(data))}
              futureValue={mapQuery(netBorrowApr ?? DISABLED_Q, data => formatCappedRatePercent(data))}
              size="small"
              testId="borrow-net-apr"
            />
          )}
        </Stack>
        <Stack>
          {useNewLlamalendHealth() ? (
            <>
              <ActionInfo
                label={t`Health`}
                labelTooltip={{ title: t`Health`, body: <HealthTooltipContent /> }}
                value={formatHealthQuery(oraclePrice, prevPrices)}
                futureValue={prices && !isFullRepay ? formatHealthQuery(oraclePrice, prices) : UNAVAILABLE_NOTATION}
                size="small"
                testId="borrow-health"
              />
              <ActionInfo
                label={t`Liquidation buffer`}
                labelTooltip={{ title: t`Liquidation buffer`, body: <LiquidationBufferTooltipContent /> }}
                value={mapQuery(prevLiquidationBuffer ?? DISABLED_Q, data => formatNumber(data, 'percent.value'))}
                futureValue={
                  liquidationBuffer && !isFullRepay
                    ? mapQuery(liquidationBuffer, data => formatNumber(data, 'percent.value'))
                    : UNAVAILABLE_NOTATION
                }
                size="small"
                testId="borrow-liquidation-buffer"
              />
            </>
          ) : (
            <ActionInfo
              label={t`Health`}
              value={prevHealth ? mapQuery(prevHealth, data => formatNumber(data, 'legacyHealth')) : DISABLED_Q}
              futureValue={
                // todo: do not ignore loading state for health - some forms/tests expect the fallback when the query is disabled
                isFullRepay
                  ? '∞'
                  : health?.data === undefined
                    ? UNAVAILABLE_NOTATION
                    : mapQuery(health, data => formatNumber(data, 'legacyHealth'))
              }
              valueColor={getLegacyHealthValueColor({
                health: health?.data,
                prevHealth: prevHealth?.data,
                theme,
                isFullRepay,
              })}
              size="small"
              testId="borrow-health"
            />
          )}
          {(loanToValue ?? prevLoanToValue) && (
            <ActionInfo
              label={
                <Tooltip title={t`Loan to value ratio`} placement="top">
                  <span>{t`LTV`}</span>
                </Tooltip>
              }
              value={mapQuery(prevLoanToValue ?? DISABLED_Q, data => formatNumber(data, 'percent.rate'))}
              futureValue={mapQuery(loanToValue ?? DISABLED_Q, data => formatNumber(data, 'percent.rate'))}
              size="small"
              testId="borrow-ltv"
            />
          )}
          <SmallLiquidationRangeChart
            prices={prices}
            prevPrices={prevPrices}
            oraclePrice={oraclePrice}
            isFullRepay={isFullRepay}
          />
          {(prices ?? prevPrices) && !isFullRepay && (
            <ActionInfo
              label={t`Liquidation range`}
              value={mapQuery(prevPrices ?? DISABLED_Q, data =>
                data?.map(p => formatNumber(p, { abbreviate: false })).join(' - '),
              )}
              futureValue={mapQuery(prices ?? DISABLED_Q, data =>
                data?.map(p => formatNumber(p, { abbreviate: false })).join(' - '),
              )}
              valueRight={notFalsy(collateralSymbol, borrowSymbol).join('/')}
              size="small"
              testId="borrow-price-range"
            />
          )}
        </Stack>
        {!leverageEnabled && (
          <Stack>
            {(collateral ?? prevCollateral) && (
              <ActionInfo
                label={t`Collateral`}
                value={mapQuery(prevCollateral ?? DISABLED_Q, data => formatNumber(data, { abbreviate: false }))}
                futureValue={mapQuery(collateral ?? DISABLED_Q, data =>
                  isFullRepay ? 0 : formatNumber(data, { abbreviate: false }),
                )}
                valueRight={collateralSymbol}
                size="small"
                testId="borrow-collateral"
              />
            )}
            {debtActionInfo}
          </Stack>
        )}
      </Stack>

      {leverageEnabled && (
        <Stack data-testid="borrow-leverage-info-list">
          {(prevLeverageValue ?? leverageValue) && (
            <ActionInfo
              label={t`Leverage`}
              value={
                leverageValue?.data !== undefined && prevLeverageValue
                  ? mapQuery(prevLeverageValue, data => formatLeverage(data))
                  : DISABLED_Q
              }
              futureValue={mapQuery(leverageValue ?? DISABLED_Q, data => formatLeverage(data))}
              currentValueColor={getLeverageValueColor(prevLeverageValue?.data)}
              valueColor={getLeverageValueColor(leverageValue?.data)}
              size="small"
              testId="borrow-leverage"
            />
          )}
          {(prevLoopedApr ?? loopedApr) ? (
            <ActionInfo
              label={t`Looped APR`}
              labelTooltip={{ title: t`Looped APR`, body: <LoopedAprTooltipContent /> }}
              value={
                loopedApr?.data !== undefined && prevLoopedApr
                  ? mapQuery(prevLoopedApr, data => formatNumber(data, 'percent.rate'))
                  : DISABLED_Q
              }
              futureValue={mapQuery(loopedApr ?? DISABLED_Q, data => formatNumber(data, 'percent.rate'))}
              size="small"
              testId="borrow-looped-apr"
            />
          ) : (
            collateralApy &&
            (prevCollateralLeverageValue ?? collateralLeverageValue) && (
              <ActionInfo
                label={t`Return on Equity (RoE)`}
                value={formatReturnOnEquity(prevCollateralLeverageValue, prevRates, collateralApy)}
                futureValue={formatReturnOnEquity(
                  collateralLeverageValue,
                  /** Collateral-only actions have no future rate query, so future return on equity uses the current rate. */
                  rates?.data === undefined && !rates?.isLoading && !rates?.error ? prevRates : rates,
                  collateralApy,
                )}
                size="small"
                testId="borrow-return-on-equity"
              />
            )
          )}
          {(prevLeverageCollateral ?? leverageCollateral) && (
            <ActionInfo
              label={t`Leverage collateral`}
              value={
                leverageCollateral?.data && prevLeverageCollateral
                  ? mapQuery(prevLeverageCollateral, data => formatAmount(data, collateralSymbol))
                  : DISABLED_Q
              }
              futureValue={mapQuery(leverageCollateral ?? DISABLED_Q, data => formatAmount(data, collateralSymbol))}
              size="small"
              testId="borrow-leverage-collateral"
            />
          )}
          {(prevLeverageTotalCollateral ?? leverageTotalCollateral) && (
            <ActionInfo
              label={t`Total collateral`}
              value={
                leverageTotalCollateral?.data && prevLeverageTotalCollateral
                  ? mapQuery(prevLeverageTotalCollateral, data => formatAmount(data, collateralSymbol))
                  : DISABLED_Q
              }
              futureValue={mapQuery(leverageTotalCollateral ?? DISABLED_Q, data =>
                formatAmount(data, collateralSymbol),
              )}
              size="small"
              testId="borrow-leverage-total-collateral"
            />
          )}
          {debtActionInfo}
        </Stack>
      )}

      <Stack>
        <ActionInfoGasEstimate gas={gas} isApproved={isApproved?.data} />
      </Stack>
    </ActionInfoCollapse>
  )
}
