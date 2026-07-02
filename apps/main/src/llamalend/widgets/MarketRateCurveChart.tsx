import { sortBy } from 'lodash'
import { useMemo, useState } from 'react'
import { getUtilizationPercent, tokenMetric } from '@/llamalend/llama.utils'
import { useMarketCapAndAvailable, useMarketTotalCollateral, useRateCurve } from '@/llamalend/queries/market'
import { TooltipOptions, TotalCollateralTooltip, UtilizationTooltip } from '@/llamalend/widgets/tooltips'
import { RateCurveTooltip } from '@/llamalend/widgets/tooltips/chart/RateCurveTooltip'
import { CardContent, Stack } from '@mui/material'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { useTheme } from '@mui/material/styles'
import { Decimal } from '@primitives/decimal.utils'
import { maybes, notFalsy } from '@primitives/objects.utils'
import { combineQueries } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import {
  CHART_LINE_DASH_PATTERNS,
  ChartFooter,
  type ChartLineDashPattern,
  ChartStateWrapper,
  EChartsLineChart,
  type LegendItem,
  type LineSeriesConfig,
} from '@ui-kit/shared/ui/Chart'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'
import { fallbackQ, mapQuery, q, useMappedQuery } from '@ui-kit/types/util'
import { decimal, decimalMax, decimalMinus, decimalMultiply, decimalSum, formatNumber } from '@ui-kit/utils'
import { useMarketContext } from '../features/market-context'

const { Spacing, Height } = SizesAndSpaces

const METRIC_CATEGORY = 'llamalend.marketCharts'

export type RateCurveChartPoint = {
  utilization: number
  borrowApr: number
  supplyApy: number
}

type RateCurveSeriesKey = keyof Omit<RateCurveChartPoint, 'utilization'>

const SERIES_CONFIG: { key: RateCurveSeriesKey; label: string; dash?: ChartLineDashPattern }[] = [
  { key: 'borrowApr', label: t`Borrow APR` },
  { key: 'supplyApy', label: t`Supply APY`, dash: CHART_LINE_DASH_PATTERNS.wide },
]

const transform = ({ rates = [] }: { rates: RateCurveChartPoint[] | undefined }): RateCurveChartPoint[] =>
  sortBy(rates, 'utilization')

/**
 * Returns the total collateral expressed in collateral-token units.
 * The borrowed-token portion can appear in collateral after soft liquidation, so it must be converted through USD rates
 * before being added to the native collateral amount.
 *
 * Example: 10 WETH collateral + 4,000 crvUSD borrowed collateral, with WETH at $2,000 and crvUSD at $1,
 * becomes 12 WETH: 10 + (4,000 * 1 / 2,000).
 */
const calculateCombinedCollateral = ({
  collateral,
  borrowed,
  collateralUsdRate,
  borrowUsdRate,
}: {
  collateral: Decimal | undefined
  borrowed: Decimal | undefined
  collateralUsdRate: number
  borrowUsdRate: number
}) =>
  collateralUsdRate === 0
    ? undefined
    : maybes([collateral, borrowed], (collateral, borrowed) =>
        decimalSum(collateral, decimalMultiply(borrowed, borrowUsdRate / collateralUsdRate)),
      )

export const MarketRateCurveChart = () => {
  const {
    chainId,
    blockchainId,
    marketId,
    controllerAddress,
    apiMarket,
    tokens: { collateralToken, borrowToken },
  } = useMarketContext()
  const [visibleSeries, setVisibleSeries] = useState<RateCurveSeriesKey[]>(SERIES_CONFIG.map(({ key }) => key))
  const {
    design: { Color },
  } = useTheme()
  const rateCurve = useRateCurve({ blockchainId, contractAddress: controllerAddress })
  const capAndAvailable = useMarketCapAndAvailable({ chainId, marketId })
  const totalCollateral = useMarketTotalCollateral({ chainId, marketId })
  const collateralUsdRate = useTokenUsdRate({ chainId, tokenAddress: collateralToken?.address })
  const borrowedUsdRate = useTokenUsdRate({ chainId, tokenAddress: borrowToken?.address })

  const currentUtilization = fallbackQ(
    mapQuery(capAndAvailable, ({ available, totalAssets }) => getUtilizationPercent(available, totalAssets)),
    mapQuery(rateCurve, ({ currentUtilization }) => currentUtilization),
  )
  const totalBorrowed = mapQuery(capAndAvailable, ({ available, totalAssets }) =>
    maybes([available, totalAssets], (available, totalAssets) => decimalMax(decimalMinus(totalAssets, available), '0')),
  )
  const utilizationBreakdown = combineQueries(
    [totalBorrowed, capAndAvailable],
    (borrow, { totalAssets }) =>
      `${formatNumber(borrow, { abbreviate: true })}/${formatNumber(totalAssets, {
        abbreviate: true,
      })} ${borrowToken?.symbol ?? ''}`,
  )

  const collateralTotal = mapQuery(totalCollateral, totalCollateral => totalCollateral.collateral)
  const borrowedCollateralTotal = mapQuery(totalCollateral, totalCollateral => totalCollateral.borrowed)
  const combinedCollateral = combineQueries(
    [totalCollateral, collateralUsdRate, borrowedUsdRate],
    ({ collateral, borrowed }, collateralUsdRate, borrowUsdRate) =>
      calculateCombinedCollateral({ collateral, borrowed, collateralUsdRate, borrowUsdRate }),
  )

  const collateralUsdValue = combineQueries([collateralTotal, collateralUsdRate], (total, usdRate) => +total * usdRate)
  const borrowedCollateralUsdValue = combineQueries(
    [borrowedCollateralTotal, borrowedUsdRate],
    (total, usdRate) => +total * usdRate,
  )
  const combinedCollateralUsdValue = combineQueries([collateralUsdValue, borrowedCollateralUsdValue], (c, b) => c + b)

  const chartData = useMappedQuery(rateCurve, transform)

  const markLines = useMemo(
    () =>
      notFalsy(
        currentUtilization.data != null && {
          value: currentUtilization.data,
          label: formatNumber(currentUtilization.data, 'percent.rate'),
          color: Color.Primary[500],
          dash: CHART_LINE_DASH_PATTERNS.tight,
        },
      ),
    [currentUtilization.data, Color.Primary],
  )

  const seriesColors: Record<RateCurveSeriesKey, string> = useMemo(
    () => ({ borrowApr: Color.Primary[500], supplyApy: Color.Tertiary[400] }),
    [Color.Primary, Color.Tertiary],
  )

  const series: LineSeriesConfig<RateCurveSeriesKey>[] = useMemo(
    () => SERIES_CONFIG.map(serie => ({ ...serie, color: seriesColors[serie.key] })),
    [seriesColors],
  )

  const legendSets: LegendItem[] = useMemo(
    () =>
      SERIES_CONFIG.map(({ key, label, dash }) => ({
        label,
        line: { lineStroke: seriesColors[key], dash },
        toggled: visibleSeries.includes(key),
        onToggle: () =>
          setVisibleSeries(prev => (prev.includes(key) ? prev.filter(item => item !== key) : [...prev, key])),
      })),
    [seriesColors, visibleSeries],
  )

  return (
    <Card size="small" data-testid="interest-rate-utilization-chart">
      <CardHeader title={t`Interest Rate & Utilization`} />
      <CardContent component={Stack} sx={{ gap: Spacing.md }}>
        <Stack
          sx={{
            display: 'grid',
            gap: Spacing.xl,
            gridTemplateColumns: { mobile: 'repeat(2, 1fr)', tablet: 'repeat(4, 1fr)' },
          }}
        >
          <Metric
            category={METRIC_CATEGORY}
            label={t`Utilization`}
            value={fallbackQ(
              currentUtilization,
              mapQuery(apiMarket, m => m.utilizationPercent),
            )}
            valueOptions={{ unit: 'percentage' }}
            notional={utilizationBreakdown}
            valueTooltip={{
              title: t`Utilization`,
              body: <UtilizationTooltip marketType={LlamaMarketType.Lend} />,
              ...TooltipOptions,
            }}
          />
          <Metric
            category={METRIC_CATEGORY}
            label={t`Total borrowed`}
            {...tokenMetric({
              value: fallbackQ(
                totalBorrowed,
                mapQuery(apiMarket, m => m.assets.borrowed.balance),
              ),
              symbol: borrowToken?.symbol,
              usdRate: q(borrowedUsdRate),
            })}
          />
          <Metric
            category={METRIC_CATEGORY}
            label={t`Total collateral`}
            {...tokenMetric({
              value: fallbackQ(
                combinedCollateral,
                combineQueries([apiMarket, collateralUsdRate], (market, collateralUsdRate) =>
                  collateralUsdRate ? decimal(market.totalCollateralUsd / collateralUsdRate) : undefined,
                ),
              ),
              symbol: collateralToken?.symbol,
              usdRate: q(collateralUsdRate),
            })}
            valueTooltip={{
              title: t`Total Collateral`,
              body: (
                <TotalCollateralTooltip
                  collateralSymbol={collateralToken?.symbol}
                  totalCollateral={collateralTotal.data}
                  borrowedSymbol={borrowToken?.symbol}
                  totalBorrowed={borrowedCollateralTotal.data}
                  combinedCollateralUsdValue={combinedCollateralUsdValue.data}
                  collateralUsdRate={collateralUsdRate.data ?? null}
                  borrowedUsdRate={borrowedUsdRate.data ?? null}
                />
              ),
              ...TooltipOptions,
            }}
          />
        </Stack>
        <ChartStateWrapper
          height={Height.shortChart}
          isLoading={chartData.isLoading}
          error={chartData.error}
          errorMessage={t`Unable to fetch rate curve data.`}
        >
          <EChartsLineChart<RateCurveChartPoint, RateCurveSeriesKey, 'utilization'>
            data={chartData.data ?? []}
            height={Height.shortChart}
            xKey="utilization"
            series={series}
            visibleSeries={visibleSeries}
            xAxisType="value"
            markLines={markLines}
            xTickFormatter={value => formatNumber(+value, 'percent.rate')}
            yTickFormatter={value => formatNumber(+value, 'percent.rate')}
            yPaddingRatio={0.05}
            renderTooltip={RateCurveTooltip}
          />
        </ChartStateWrapper>
        <ChartFooter
          legendSets={legendSets}
          description={t`This chart illustrates the relationship between utilization and interest rates in this market. It reflects the market’s monetary policy—how rates adjust based on supply and demand dynamics.`}
        />
      </CardContent>
    </Card>
  )
}
