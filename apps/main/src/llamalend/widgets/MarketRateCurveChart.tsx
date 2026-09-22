import { sortBy } from 'lodash'
import { useMemo, useState } from 'react'
import { getUtilizationPercent } from '@/llamalend/llama.utils'
import { useMarketCapAndAvailable, useMarketTotalDebt, useRateCurve } from '@/llamalend/queries/market'
import { TotalDebtMetric, TotalLiquidityMetric } from '@/llamalend/widgets/MarketMetrics'
import { useAvailableLiquidity } from '@/llamalend/widgets/page-header/hooks/usePageHeader'
import { TooltipOptions, UtilizationTooltip } from '@/llamalend/widgets/tooltips'
import { RateCurveTooltip } from '@/llamalend/widgets/tooltips/chart/RateCurveTooltip'
import {
  CHART_LINE_DASH_PATTERNS,
  ChartFooter,
  type ChartLineDashPattern,
  EChartsLineChart,
  EvmChartStateWrapper,
  type LegendItem,
  type LineSeriesConfig,
} from '@evm-ui/shared/ui/Chart'
import { MarketType } from '@evm-ui/types/market'
import { CardContent, Stack } from '@mui/material'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { useTheme } from '@mui/material/styles'
import { formatNumber } from '@primitives/number.utils'
import { notFalsy } from '@primitives/objects.utils'
import { Metric } from '@ui/components/Metric'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { combineQueries } from '@ui/features/queries/combine'
import { fallbackQ, mapQuery, q, useMappedQuery } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { decimal } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { useMarketContext } from '../features/market-context'

const { Spacing, Height } = SizesAndSpaces

const METRIC_CATEGORY = 'llamalend.marketCharts'

export type RateCurveChartPoint = { utilization: number; borrowApr: number; supplyApy: number }

type RateCurveSeriesKey = keyof Omit<RateCurveChartPoint, 'utilization'>

const SERIES_CONFIG: { key: RateCurveSeriesKey; label: string; dash?: ChartLineDashPattern }[] = [
  { key: 'borrowApr', label: t`Borrow APR` },
  { key: 'supplyApy', label: t`Supply APY`, dash: CHART_LINE_DASH_PATTERNS.wide },
]

const transform = ({ rates = [] }: { rates: RateCurveChartPoint[] | undefined }): RateCurveChartPoint[] =>
  sortBy(rates, 'utilization')

export const MarketRateCurveChart = () => {
  const {
    chainId,
    blockchainId,
    marketId,
    marketQuery,
    controllerAddress,
    apiMarket,
    tokens: { borrowToken },
  } = useMarketContext()
  const [visibleSeries, setVisibleSeries] = useState<RateCurveSeriesKey[]>(SERIES_CONFIG.map(({ key }) => key))
  const {
    design: { Color },
  } = useTheme()
  const rateCurve = useRateCurve({ blockchainId, contractAddress: controllerAddress })
  const capAndAvailable = useMarketCapAndAvailable({ chainId, marketId })
  const totalDebt = fallbackQ(
    q(useMarketTotalDebt({ chainId, marketId })),
    mapQuery(apiMarket, market => decimal(market.assets.borrowed.balance)),
  )
  const availableLiquidity = useAvailableLiquidity({ chainId, marketQuery, apiMarket })

  const currentUtilization = fallbackQ(
    mapQuery(capAndAvailable, ({ available, totalAssets }) => getUtilizationPercent(available, totalAssets)),
    mapQuery(rateCurve, ({ currentUtilization }) => currentUtilization),
  )
  const utilizationBreakdown = combineQueries(
    [totalDebt, capAndAvailable],
    (debt, { totalAssets }) =>
      `${formatNumber(debt, { abbreviate: true })}/${formatNumber(totalAssets, {
        abbreviate: true,
      })} ${borrowToken?.symbol ?? ''}`,
  )

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
        <MetricsGrid>
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
              body: <UtilizationTooltip marketType={MarketType.Lend} />,
              ...TooltipOptions,
            }}
          />
          <TotalDebtMetric
            category={METRIC_CATEGORY}
            value={totalDebt}
            symbol={borrowToken?.symbol}
            usdRate={availableLiquidity.usdRate}
          />
          <TotalLiquidityMetric
            category={METRIC_CATEGORY}
            value={availableLiquidity.total}
            symbol={borrowToken?.symbol}
            usdRate={availableLiquidity.usdRate}
          />
        </MetricsGrid>
        <EvmChartStateWrapper
          height={Height.chart.sm}
          isLoading={chartData.isLoading}
          error={chartData.error}
          errorMessage={t`Unable to fetch rate curve data.`}
        >
          <EChartsLineChart<RateCurveChartPoint, RateCurveSeriesKey, 'utilization'>
            data={chartData.data ?? []}
            height={Height.chart.sm}
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
        </EvmChartStateWrapper>
        <ChartFooter
          legendSets={legendSets}
          description={t`This chart illustrates the relationship between utilization and interest rates in this market. It reflects the market’s monetary policy—how rates adjust based on supply and demand dynamics.`}
        />
      </CardContent>
    </Card>
  )
}
