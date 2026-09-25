import { getHealthValueColor } from '@/llamalend/features/market-position-details'
import { formatOracleHealth, formatSignedPercent, oracleHealth } from '@/llamalend/features/market-position-details/position-metrics.utils'
import { type BorrowRates, formatReturnOnEquity } from '@/llamalend/rates.utils'
import { ReturnToWalletActionInfo } from '@/llamalend/widgets/action-card/ReturnToWalletActionInfo'
import { SmallLiquidationRangeChart } from '@/llamalend/widgets/small-liquidation-range-chart/SmallLiquidationRangeChart'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import { formatCappedRatePercent } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { maybe, notFalsy } from '@primitives/objects.utils'
import { Tooltip } from '@ui/components/Tooltip'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { ActionInfoGasEstimate, type TxGasInfo } from '@ui/features/forms/action-info/ActionInfoGasEstimate'
import { mapQuery, q, type QueryProp, type Range, DISABLED_Q } from '@ui/features/queries/util'
import { useShowNetRate } from '@ui/features/storage/useLocalStorage'
import { decimal } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { ActionInfoCollapse } from './ActionInfoCollapse'
import { useShouldShowNetRate } from './hooks/useShouldShowNetRate'
import { ACTION_INFO_GROUP_SX, formatAmount, formatLeverage } from './info-actions.helpers'

/** Health on the action list is the same oracle ratio as the card, using the range this form already previews. */
const oracleRatio = (oracle: QueryProp<Decimal | null>, range: QueryProp<Range<Decimal> | null> | undefined) => {
  const upper = range?.data?.[1]
  const ratio = oracle.data && upper ? oracleHealth(oracle.data, upper) : undefined
  const pending = ratio == undefined
  return q({
    data: maybe(ratio, formatOracleHealth),
    isLoading: pending && Boolean(oracle.isLoading || range?.isLoading),
    error: pending ? (oracle.error ?? range?.error ?? null) : null,
  })
}

/** Buffer is the preview health those forms already load, in percentage points. */
const signedHealth = (health: QueryProp<Decimal | null> | undefined) =>
  health
    ? mapQuery(health, data => maybe(decimal(data), formatSignedPercent))
    : DISABLED_Q

export type LoanActionInfoListProps = {
  isOpen: boolean
  isApproved?: QueryProp<boolean>
  health?: QueryProp<Decimal | null>
  prevHealth?: QueryProp<Decimal | null>
  isFullRepay?: boolean
  prices?: QueryProp<Range<Decimal> | null>
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
  prevLeverageCollateral?: QueryProp<Decimal | null>
  leverageCollateral?: QueryProp<Decimal | null>
  prevLeverageTotalCollateral?: QueryProp<Decimal | null>
  leverageTotalCollateral?: QueryProp<Decimal | null>
  collateralSymbol?: string
  borrowSymbol?: string
  /** Whether to show leverage-related fields (leverage value, leverage collateral...) */
  leverageEnabled?: boolean
  /** Card return on equity. When set, it replaces the leverage-times-APY estimate. */
  positionRoe?: QueryProp<string | undefined>
}

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
  prevLeverageCollateral,
  leverageCollateral,
  prevLeverageTotalCollateral,
  leverageTotalCollateral,
  collateralSymbol,
  borrowSymbol,
  leverageEnabled,
  positionRoe,
}: LoanActionInfoListProps) => {
  const betaMetrics = useNewLlamalendHealth()
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
              label={t`Borrow APR`}
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
          <ActionInfo
            label={t`Health`}
            value={
              betaMetrics
                ? oracleRatio(oraclePrice, prevPrices)
                : prevHealth
                  ? mapQuery(prevHealth, data => formatNumber(data, 'health.compact'))
                  : DISABLED_Q
            }
            futureValue={
              betaMetrics
                ? isFullRepay
                  ? t`Position closed`
                  : oracleRatio(oraclePrice, prices)
                : isFullRepay
                  ? '∞'
                  : health?.data === undefined
                    ? '-'
                    : mapQuery(health, data => formatNumber(data, 'health.compact'))
            }
            valueColor={
              betaMetrics
                ? undefined
                : getHealthValueColor({
                    health: health?.data,
                    prevHealth: prevHealth?.data,
                    theme,
                    isFullRepay,
                  })
            }
            size="small"
            testId="borrow-health"
          />
          {betaMetrics && (
            <ActionInfo
              label={t`Liquidation buffer`}
              value={signedHealth(prevHealth)}
              futureValue={isFullRepay ? t`Not applicable` : signedHealth(health)}
              size="small"
              testId="borrow-buffer"
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
          {!leverageEnabled && debtActionInfo}
        </Stack>
      </Stack>

      {leverageEnabled && (
        <Stack data-testid="borrow-leverage-info-list">
          {(prevLeverageValue ?? leverageValue) && (
            <ActionInfo
              label={t`Leverage`}
              value={
                leverageValue?.data && prevLeverageValue
                  ? mapQuery(prevLeverageValue, data => formatLeverage(data))
                  : DISABLED_Q
              }
              futureValue={mapQuery(leverageValue ?? DISABLED_Q, data => formatLeverage(data))}
              size="small"
              testId="borrow-leverage"
            />
          )}
          {collateralApy && (
            <ActionInfo
              label={t`Return on Equity (RoE)`}
              value={positionRoe ?? formatReturnOnEquity(prevLeverageValue, prevRates, collateralApy)}
              futureValue={positionRoe ? t`Estimate unavailable` : formatReturnOnEquity(
                leverageValue,
                /** Collateral-only actions have no future rate query, so future return on equity uses the current rate. */
                rates?.data === undefined && !rates?.isLoading && !rates?.error ? prevRates : rates,
                collateralApy,
              )}
              size="small"
              testId="borrow-return-on-equity"
            />
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
