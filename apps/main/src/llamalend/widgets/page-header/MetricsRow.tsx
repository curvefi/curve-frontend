import { SUPPLY_RATE_TITLE } from '@/llamalend/constants'
import { hasNetSupplyRate } from '@/llamalend/llama.utils'
import { BorrowAprMetric } from '@/llamalend/widgets/BorrowAprMetric'
import { AvailableLiquidityMetric, TotalLiquidityMetric } from '@/llamalend/widgets/MarketMetrics'
import { MarketType, MarketRateType } from '@evm-ui/types/market'
import { AVERAGE_CATEGORIES } from '@evm-ui/utils'
import { Metric } from '@ui/components/Metric'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { formatCappedRatePercent, formatCappedRateValue } from '@ui/lib/rates.utils'
import { MarketSupplyRateTooltipContent } from '../tooltips/MarketSupplyRateTooltipContent'
import { TooltipOptions } from '../tooltips/tooltip.utils'
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

  const borrowRateMetric = <BorrowAprMetric borrowRate={borrowRate} collateralSymbol={collateral?.symbol} />

  const showNetSupplyRate =
    supplyRate?.data?.totalMinBoost != null &&
    hasNetSupplyRate({
      extraRewards: supplyRate.data.extraRewards,
      extraIncentives: supplyRate.data.extraIncentives,
      rebasingYieldApy: supplyRate.data.rebasingYield,
    })

  const supplyRateMetric = supplyRate && (
    <Metric
      category={METRIC_CATEGORY}
      testId="market-supply-apy"
      label={SUPPLY_RATE_TITLE}
      value={mapQuery(supplyRate, ({ supplyApy }) => supplyApy)}
      valueOptions={{ unit: 'percentage', abbreviate: false, formatter: formatCappedRateValue }}
      {...(showNetSupplyRate && {
        notional: mapQuery(supplyRate, ({ totalMinBoost }) => t`${formatCappedRatePercent(totalMinBoost)} Total`),
      })}
      valueTooltip={{
        title: SUPPLY_RATE_TITLE,
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
