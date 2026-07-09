import { LEVERAGE } from '@/llamalend/constants'
import { getHealthValueColor } from '@/llamalend/features/market-position-details'
import type { MarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import { ReturnToWalletActionInfo } from '@/llamalend/widgets/action-card/ReturnToWalletActionInfo'
import { SmallLiquidationRangeChart } from '@/llamalend/widgets/small-liquidation-range-chart/SmallLiquidationRangeChart'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { Decimal } from '@primitives/decimal.utils'
import { notFalsy } from '@primitives/objects.utils'
import { useShowNetRate } from '@ui-kit/hooks/useLocalStorage'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo, ActionInfoGasEstimate, type TxGasInfo } from '@ui-kit/shared/ui/ActionInfo'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { constQ, mapQuery, type QueryProp, type Range, DISABLED_Q } from '@ui-kit/types/util'
import { decimal, formatNumber } from '@ui-kit/utils'
import {
  getPriceImpactDisplay,
  getPriceImpactPercent,
  type PriceImpact,
} from '@ui-kit/widgets/DetailPageLayout/price-impact.util'
import { RouteProvidersAccordion } from '@ui-kit/widgets/RouteProvider'
import { SlippageToleranceActionInfo } from '@ui-kit/widgets/SlippageSettings'
import { ActionInfoCollapse } from './ActionInfoCollapse'
import { useShouldShowNetRate } from './hooks/useShouldShowNetRate'
import { ACTION_INFO_GROUP_SX, formatAmount, formatLeverage } from './info-actions.helpers'

export type LoanActionInfoListProps = {
  isOpen: boolean
  isApproved?: QueryProp<boolean>
  health?: QueryProp<Decimal | null>
  prevHealth?: QueryProp<Decimal | null>
  isFullRepay?: boolean
  prices?: QueryProp<Range<Decimal> | null>
  prevPrices?: QueryProp<Range<Decimal> | null>
  rates?: QueryProp<{ borrowApr?: Decimal } | null>
  prevRates?: QueryProp<{ borrowApr?: Decimal } | null>
  exchangeRate?: QueryProp<Decimal | null>
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
  priceImpact?: QueryProp<PriceImpact | Decimal | null>
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
  priceImpact,
  slippage,
  onSlippageChange,
  collateralSymbol,
  borrowSymbol,
  leverageEnabled,
  routes,
}: LoanActionInfoListProps) => {
  const [isRoutesOpen, , , toggleRoutes] = useSwitch(false)
  const { label: priceImpactLabel, color: priceImpactColor } = getPriceImpactDisplay(priceImpact, {
    slippage,
    slippageType: LEVERAGE,
  })
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
          value={mapQuery(debt ?? DISABLED_Q, data => formatNumber(data, { abbreviate: false }))}
          prevValue={prevDebt && mapQuery(prevDebt, data => formatNumber(data, { abbreviate: false }))}
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
              value={mapQuery(
                rates ?? DISABLED_Q,
                data => data?.borrowApr && formatNumber(data.borrowApr, 'percent.rate'),
              )}
              prevValue={
                prevRates &&
                mapQuery(prevRates, data => data?.borrowApr && formatNumber(data.borrowApr, 'percent.rate'))
              }
              size="small"
              testId="borrow-apr"
            />
          )}
          {shouldShowNetBorrowApr && (
            <ActionInfo
              label={t`Net borrow APR`}
              value={mapQuery(netBorrowApr ?? DISABLED_Q, data => formatNumber(data, 'percent.rate'))}
              prevValue={prevNetBorrowApr && mapQuery(prevNetBorrowApr, data => formatNumber(data, 'percent.rate'))}
              size="small"
              testId="borrow-net-apr"
            />
          )}
        </Stack>
        <Stack>
          <ActionInfo
            label={t`Health`}
            value={
              // todo: do not ignore loading state for health - some forms/tests expect ∞ when the query is disabled
              isFullRepay || health?.data === undefined
                ? constQ('∞')
                : mapQuery(health, data => formatNumber(data, { abbreviate: true, fallback: '∞' }))
            }
            prevValue={
              prevHealth && mapQuery(prevHealth, data => formatNumber(data, { abbreviate: true, fallback: '∞' }))
            }
            valueColor={getHealthValueColor({
              health: health?.data,
              prevHealth: prevHealth?.data,
              theme: useTheme(),
              isFullRepay,
            })}
            size="small"
            testId="borrow-health"
          />
          {(loanToValue ?? prevLoanToValue) && (
            <ActionInfo
              label={
                <Tooltip title={t`Loan to value ratio`} placement="top">
                  <span>{t`LTV`}</span>
                </Tooltip>
              }
              value={mapQuery(loanToValue ?? DISABLED_Q, data => formatNumber(data, 'percent.rate'))}
              prevValue={prevLoanToValue && mapQuery(prevLoanToValue, data => formatNumber(data, 'percent.rate'))}
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
              value={mapQuery(prices ?? DISABLED_Q, data =>
                data?.map(p => formatNumber(p, { abbreviate: false })).join(' - '),
              )}
              prevValue={
                prevPrices &&
                mapQuery(prevPrices, data => data?.map(p => formatNumber(p, { abbreviate: false })).join(' - '))
              }
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
              value={mapQuery(collateral ?? DISABLED_Q, data =>
                isFullRepay ? 0 : formatNumber(data, { abbreviate: false }),
              )}
              prevValue={prevCollateral && mapQuery(prevCollateral, data => formatNumber(data, { abbreviate: false }))}
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
              value={mapQuery(leverageValue ?? DISABLED_Q, data => formatLeverage(data))}
              prevValue={
                leverageValue?.data && prevLeverageValue
                  ? mapQuery(prevLeverageValue, data => formatLeverage(data))
                  : undefined
              }
              size="small"
              testId="borrow-leverage"
            />
          )}
          {(prevLeverageCollateral ?? leverageCollateral) && (
            <ActionInfo
              label={t`Leverage collateral`}
              value={mapQuery(leverageCollateral ?? DISABLED_Q, data => formatAmount(data, collateralSymbol))}
              prevValue={
                leverageCollateral?.data && prevLeverageCollateral
                  ? mapQuery(prevLeverageCollateral, data => formatAmount(data, collateralSymbol))
                  : undefined
              }
              size="small"
              testId="borrow-leverage-collateral"
            />
          )}
          {(prevLeverageTotalCollateral ?? leverageTotalCollateral) && (
            <ActionInfo
              label={t`Total collateral`}
              value={mapQuery(leverageTotalCollateral ?? DISABLED_Q, data => formatAmount(data, collateralSymbol))}
              prevValue={
                leverageTotalCollateral?.data && prevLeverageTotalCollateral
                  ? mapQuery(prevLeverageTotalCollateral, data => formatAmount(data, collateralSymbol))
                  : undefined
              }
              size="small"
              testId="borrow-leverage-total-collateral"
            />
          )}
          {debtActionInfo}
        </Stack>
      )}

      <Stack>
        {slippage && onSlippageChange && (
          <SlippageToleranceActionInfo
            maxSlippage={slippage}
            type={LEVERAGE}
            onChanged={({ leverage }) => onSlippageChange(leverage)}
            size="small"
          />
        )}
        {priceImpact && (
          <ActionInfo
            label={priceImpactLabel}
            value={mapQuery(priceImpact, data => formatNumber(getPriceImpactPercent(data), 'percent.rate'))}
            valueColor={priceImpactColor}
            size="small"
            testId="borrow-price-impact"
          />
        )}

        {exchangeRate && collateralSymbol && borrowSymbol && (
          <ActionInfo
            label={t`Exchange rate`}
            value={mapQuery(
              exchangeRate,
              data =>
                `1 ${collateralSymbol} = ${formatNumber(decimal(data), { abbreviate: false, highPrecision: true })} ${borrowSymbol}`,
            )}
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
