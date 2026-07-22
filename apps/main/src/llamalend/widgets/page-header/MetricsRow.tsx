import { MarketTypeSuffix, NET_SUPPLY_RATE_TITLE } from '@/llamalend/constants'
import { tokenMetric } from '@/llamalend/llama.utils'
import { BorrowAprMetric } from '@/llamalend/widgets/BorrowAprMetric'
import { MarketMetricGrid } from '@/llamalend/widgets/MarketMetricGrid'
import { MarketSupplyRateTooltipContent, AvailableLiquidityTooltip, TooltipOptions } from '@/llamalend/widgets/tooltips'
import Stack from '@mui/material/Stack'
import { maybe } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketType, MarketRateType } from '@ui-kit/types/market'
import { mapQuery, type QueryProp } from '@ui-kit/types/util'
import { AVERAGE_CATEGORIES } from '@ui-kit/utils'
import type { AvailableLiquidity, BorrowRate, SupplyRate } from './hooks/usePageHeader'

const { Spacing } = SizesAndSpaces
const METRIC_CATEGORY = 'llamalend.marketHeader'

export const MetricsRow = ({
  borrowRate,
  supplyRate,
  availableLiquidity,
  marketType,
  collateral,
  borrowToken,
  compact,
  primaryRateType,
}: {
  borrowRate: QueryProp<BorrowRate>
  supplyRate?: QueryProp<SupplyRate>
  availableLiquidity: AvailableLiquidity
  marketType: MarketType
  collateral: { symbol: string } | undefined
  borrowToken: { symbol: string } | undefined
  compact: boolean
  primaryRateType: MarketRateType
}) => {
  const supplyRatePeriod = supplyRate?.data ? AVERAGE_CATEGORIES[supplyRate.data.averageCategory].period : null
  const borrowRateMetric = (
    <BorrowAprMetric marketType={marketType} borrowRate={borrowRate} collateralSymbol={collateral?.symbol} />
  )
  const supplyRateMetric = supplyRate && (
    <Metric
      category={METRIC_CATEGORY}
      testId="market-net-supply-apy"
      label={NET_SUPPLY_RATE_TITLE}
      value={mapQuery(supplyRate, data => data.totalMinBoost)}
      valueOptions={{ unit: 'percentage' }}
      notional={mapQuery(supplyRate, ({ totalAverageMinBoost }) =>
        maybe(totalAverageMinBoost, value => ({
          value,
          unit: { symbol: `% ${supplyRatePeriod} Avg`, position: 'suffix' as const },
        })),
      )}
      valueTooltip={{
        title: NET_SUPPLY_RATE_TITLE,
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
  const rateMetrics =
    primaryRateType === MarketRateType.Supply ? (
      <>
        {supplyRateMetric}
        {borrowRateMetric}
      </>
    ) : (
      <>
        {borrowRateMetric}
        {supplyRateMetric}
      </>
    )

  return compact ? (
    <MarketMetricGrid>
      {rateMetrics}
      {liquidityMetrics}
    </MarketMetricGrid>
  ) : (
    <Stack
      direction="row"
      sx={{
        display: { mobile: 'grid', desktop: 'flex' },
        gridTemplateColumns: { mobile: 'repeat(2, minmax(0, 1fr))', desktop: 'none' },
        columnGap: Spacing.xxl,
        rowGap: Spacing.md,
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'start',
      }}
    >
      {borrowRateMetric}
      {supplyRateMetric}
      {liquidityMetrics}
    </Stack>
  )
}
