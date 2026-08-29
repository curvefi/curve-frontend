import { MarketTypeSuffix } from '@/llamalend/constants'
import { tokenMetric } from '@/llamalend/llama.utils'
import { BorrowAprMetric } from '@/llamalend/widgets/BorrowAprMetric'
import { MarketMetricGrid } from '@/llamalend/widgets/MarketMetricGrid'
import { MarketSupplyRateTooltipContent, AvailableLiquidityTooltip, TooltipOptions } from '@/llamalend/widgets/tooltips'
import { useRateDisplay } from '@evm-ui/hooks/useAprToApy'
import { t } from '@evm-ui/lib/i18n'
import { Metric } from '@evm-ui/shared/ui/Metric'
import { MarketType, MarketRateType } from '@evm-ui/types/market'
import { mapQuery, type QueryProp } from '@evm-ui/types/util'
import { AVERAGE_CATEGORIES, formatCappedRateValue } from '@evm-ui/utils'
import { maybe } from '@primitives/objects.utils'
import type { AvailableLiquidity, BorrowRate, SupplyRate } from './hooks/usePageHeader'

const METRIC_CATEGORY = 'llamalend.marketHeader'

export const MetricsRow = ({
  borrowRate,
  supplyRate,
  availableLiquidity,
  marketType,
  collateral,
  borrowToken,
  rateType,
}: {
  borrowRate: QueryProp<BorrowRate>
  supplyRate?: QueryProp<SupplyRate>
  availableLiquidity: AvailableLiquidity
  marketType: MarketType
  collateral: { symbol: string } | undefined
  borrowToken: { symbol: string } | undefined
  rateType: MarketRateType
}) => {
  const rateDisplay = useRateDisplay()
  const netSupplyRateTitle = rateDisplay === 'apy' ? t`Net Supply APY` : t`Net Supply APR`
  const supplyRatePeriod = supplyRate?.data ? AVERAGE_CATEGORIES[supplyRate.data.averageCategory].period : null

  const borrowRateMetric = (
    <BorrowAprMetric marketType={marketType} borrowRate={borrowRate} collateralSymbol={collateral?.symbol} />
  )

  const supplyRateMetric = supplyRate && (
    <Metric
      category={METRIC_CATEGORY}
      testId="market-net-supply-rate"
      label={netSupplyRateTitle}
      value={mapQuery(supplyRate, ({ totalMinBoost }) => totalMinBoost)}
      valueOptions={{ unit: 'percentage', abbreviate: false, formatter: formatCappedRateValue }}
      notional={mapQuery(supplyRate, ({ totalAverageMinBoost }) =>
        maybe(totalAverageMinBoost, value => ({
          value,
          abbreviate: false,
          formatter: formatCappedRateValue,
          unit: { symbol: `% ${supplyRatePeriod} Avg`, position: 'suffix' as const },
        })),
      )}
      valueTooltip={{
        title: netSupplyRateTitle,
        body: (
          <MarketSupplyRateTooltipContent
            supplyRate={supplyRate.data?.supplyRate}
            averageSupplyRate={supplyRate.data?.averageLendRate}
            totalRate={supplyRate.data?.totalMinBoost}
            totalAverageRate={supplyRate.data?.totalAverageMinBoost}
            boost={{
              type: 'market',
              rate: supplyRate.data?.supplyRateCrvMaxBoost,
              totalRate: supplyRate.data?.totalMaxBoost,
              totalAverageRate: supplyRate.data?.totalAverageMaxBoost,
            }}
            rebasingYieldRate={supplyRate.data?.rebasingYieldRate}
            isLoading={supplyRate.isLoading}
            periodLabel={supplyRatePeriod!}
            extraRewards={supplyRate.data?.extraRewards ?? []}
            extraIncentives={supplyRate.data?.extraIncentives ?? []}
          />
        ),
        ...TooltipOptions,
      }}
    />
  )

  const liquidityMetrics = (
    <>
      {marketType === MarketType.Lend && (
        <Metric
          category={METRIC_CATEGORY}
          testId="market-total-liquidity"
          label={t`Total liquidity`}
          {...tokenMetric({
            value: availableLiquidity.total,
            symbol: borrowToken?.symbol,
            usdRate: availableLiquidity.usdRate,
          })}
          valueTooltip={{
            title: t`Total liquidity`,
            body: t`Total liquidity is the total amount of the borrow token supplied to this lending market, including both available and borrowed liquidity.`,
            ...TooltipOptions,
          }}
        />
      )}
      <Metric
        category={METRIC_CATEGORY}
        testId="market-available-liquidity"
        label={t`Available liquidity`}
        {...tokenMetric({
          value: availableLiquidity.value,
          symbol: borrowToken?.symbol,
          usdRate: availableLiquidity.usdRate,
        })}
        valueTooltip={{
          title: t`Available Liquidity ${MarketTypeSuffix[marketType]}`,
          body: <AvailableLiquidityTooltip marketType={marketType} />,
          ...TooltipOptions,
        }}
      />
    </>
  )

  const [primaryRateMetric, secondaryRateMetric] =
    rateType === MarketRateType.Supply ? [supplyRateMetric, borrowRateMetric] : [borrowRateMetric, supplyRateMetric]

  return (
    <MarketMetricGrid>
      {primaryRateMetric}
      {secondaryRateMetric}
      {liquidityMetrics}
    </MarketMetricGrid>
  )
}
