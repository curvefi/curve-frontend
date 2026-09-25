import { BorrowAprMetric } from '@/llamalend/widgets/BorrowAprMetric'
import { AvailableLiquidityMetric, TotalLiquidityMetric } from '@/llamalend/widgets/MarketMetrics'
import { MarketSupplyRateTooltipContent, TooltipOptions } from '@/llamalend/widgets/tooltips'
import { MarketType, MarketRateType } from '@evm-ui/types/market'
import { AVERAGE_CATEGORIES, formatCappedRateValue } from '@evm-ui/utils'
import { maybe } from '@primitives/objects.utils'
import { Metric } from '@ui/components/Metric'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
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
  const supplyRatePeriod = supplyRate?.data ? AVERAGE_CATEGORIES[supplyRate.data.averageCategory].period : null

  const borrowRateMetric = (
    <BorrowAprMetric marketType={marketType} borrowRate={borrowRate} collateralSymbol={collateral?.symbol} />
  )

  const supplyRateMetric = supplyRate && (
    <Metric
      category={METRIC_CATEGORY}
      testId="market-net-supply-apy"
      label={t`Supply APY`}
      value={mapQuery(supplyRate, ({ supplyApy }) => supplyApy)}
      valueOptions={{ unit: 'percentage', abbreviate: false, formatter: formatCappedRateValue }}
      notional={mapQuery(supplyRate, ({ totalMinBoost }) =>
        maybe(totalMinBoost, value => ({
          value,
          abbreviate: false,
          formatter: formatCappedRateValue,
          unit: { symbol: `% ${t`Net supply APY`}`, position: 'suffix' as const },
        })),
      )}
      valueTooltip={{
        title: t`Supply APY`,
        body: (
          <MarketSupplyRateTooltipContent
            supplyApy={supplyRate.data?.supplyApy}
            averageSupplyApy={supplyRate.data?.averageLendApy}
            totalApy={supplyRate.data?.totalMinBoost}
            totalAverageApy={supplyRate.data?.totalAverageMinBoost}
            boost={{
              type: 'market',
              apy: supplyRate.data?.supplyApyCrvMaxBoost,
              totalApy: supplyRate.data?.totalMaxBoost,
              totalAverageApy: supplyRate.data?.totalAverageMaxBoost,
            }}
            rebasingYieldApy={supplyRate.data?.rebasingYield}
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
        <TotalLiquidityMetric
          category={METRIC_CATEGORY}
          testId="market-total-liquidity"
          value={availableLiquidity.total}
          symbol={borrowToken?.symbol}
          usdRate={availableLiquidity.usdRate}
        />
      )}
      <AvailableLiquidityMetric
        category={METRIC_CATEGORY}
        testId="market-available-liquidity"
        marketType={marketType}
        value={availableLiquidity.value}
        symbol={borrowToken?.symbol}
        usdRate={availableLiquidity.usdRate}
      />
    </>
  )

  const [primaryRateMetric, secondaryRateMetric] =
    rateType === MarketRateType.Supply ? [supplyRateMetric, borrowRateMetric] : [borrowRateMetric, supplyRateMetric]

  return (
    <MetricsGrid>
      {primaryRateMetric}
      {secondaryRateMetric}
      {liquidityMetrics}
    </MetricsGrid>
  )
}
