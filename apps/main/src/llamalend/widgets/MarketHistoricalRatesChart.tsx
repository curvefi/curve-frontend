import { sortBy } from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import type { MarketSnapshots } from '@/llamalend/queries/market/market-snapshots.query'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { HistoricalRatesTooltip } from '@/llamalend/widgets/tooltips/chart/HistoricalRatesTooltip'
import type { CrvUsdSnapshot } from '@evm-ui/queries/crvusd-snapshots.query'
import type { LendingSnapshot } from '@evm-ui/queries/lending-snapshots.query'
import { type TimeOption } from '@evm-ui/queries/validation/time-option-validation'
import {
  addMovingAverages,
  CHART_LINE_DASH_PATTERNS,
  type ChartLineDashPattern,
} from '@evm-ui/shared/ui/Chart/chart.utils'
import { ChartFooter } from '@evm-ui/shared/ui/Chart/ChartFooter'
import { EChartsLineChart, type LineSeriesConfig } from '@evm-ui/shared/ui/Chart/EChartsLineChart'
import { EvmChartStateWrapper } from '@evm-ui/shared/ui/Chart/EvmChartStateWrapper'
import type { LegendItem } from '@evm-ui/shared/ui/Chart/LegendSet'
import { MarketRateType } from '@evm-ui/types/market'
import { AVERAGE_WINDOW_DAYS, calculateAverageRates, hasFullTimeWindow } from '@evm-ui/utils/averageRates'
import { CardContent, Stack } from '@mui/material'
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import { formatDate } from '@primitives/date.utils'
import type { Amount } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { type Nullish, maybe, notFalsy, maybes } from '@primitives/objects.utils'
import { Metric } from '@ui/components/Metric'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { fallbackQ, mapQuery, q, type QueryProp, useMappedQuery } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { decimal } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { TIME_OPTION_MS } from '@ui/lib/time'
import { useMarketContext } from '../features/market-context'
import { useMarketRates, type MarketRates } from '../queries/market/market-rates.query'

const { Spacing, Height } = SizesAndSpaces

const METRIC_CATEGORY = 'llamalend.marketCharts'

export type RateChartPoint = { timestamp: number; rate: number; movingAverage: number; totalAverage: number }

type RateSeriesKey = 'rate' | 'movingAverage' | 'totalAverage'

export type RateSnapshot = CrvUsdSnapshot | LendingSnapshot
type RateValue = Amount | Nullish

type MarketHistoricalRatesChartProps = {
  rateMode: MarketRateType
  timeOption: TimeOption
  snapshots: QueryProp<MarketSnapshots>
}

type RateSeriesConfig = { key: RateSeriesKey; label: string; dash?: ChartLineDashPattern }
type RateModeConfig = {
  currentRateLabel: string
  averageRateLabels: { week: string; month: string; year: string }
  series: RateSeriesConfig[]
  getLiveRate: (marketRates: MarketRates | undefined) => RateValue
  getApiRate: (market: LlamaMarket) => RateValue
  getSnapshotRate: (snapshot: RateSnapshot) => RateValue
}

const toRateNumber = (rate: RateValue) => maybe(rate, rate => Number(rate)) ?? null

const toSnapshotRatePoints = (
  snapshots: RateSnapshot[] | undefined,
  getSnapshotRate: (snapshot: RateSnapshot) => RateValue,
) =>
  notFalsy(
    ...(snapshots ?? []).map(snapshot => {
      const rate = toRateNumber(getSnapshotRate(snapshot))

      return maybe(rate, rate => ({ timestamp: snapshot.timestamp, rate })) ?? null
    }),
  )

const RATE_MODE_CONFIG = {
  [MarketRateType.Borrow]: {
    currentRateLabel: t`Current APR`,
    averageRateLabels: { week: t`1W average APR`, month: t`1M average APR`, year: t`1Y average APR` },
    series: [
      { key: 'rate', label: t`Borrow APR` },
      { key: 'movingAverage', label: t`7-day MA APR`, dash: CHART_LINE_DASH_PATTERNS.tight },
      { key: 'totalAverage', label: t`Average APR`, dash: CHART_LINE_DASH_PATTERNS.regular },
    ],
    getLiveRate: marketRates => marketRates?.borrowApr ?? null,
    getApiRate: market => market.rates.borrowApr,
    getSnapshotRate: snapshot => snapshot.borrowApr,
  },
  [MarketRateType.Supply]: {
    currentRateLabel: t`Current APY`,
    averageRateLabels: { week: t`1W average APY`, month: t`1M average APY`, year: t`1Y average APY` },
    series: [
      { key: 'rate', label: t`Supply APY` },
      { key: 'movingAverage', label: t`7-day MA APY`, dash: CHART_LINE_DASH_PATTERNS.tight },
      { key: 'totalAverage', label: t`Average APY`, dash: CHART_LINE_DASH_PATTERNS.regular },
    ],
    getLiveRate: marketRates => marketRates?.lendApy ?? null,
    getApiRate: market => market.rates.lendApy,
    getSnapshotRate: snapshot => ('lendApy' in snapshot ? snapshot.lendApy * 100 : null),
  },
} satisfies Record<MarketRateType, RateModeConfig>

const averageRate = (ratePoints: { rate: number; timestamp: number }[], days: number, now: Date) =>
  calculateAverageRates(ratePoints, days, { rate: ({ rate }) => rate }, now)?.rate

const getAverageRates = ({
  points: ratePoints,
  fetchedAt: now,
}: {
  points: { rate: number; timestamp: number }[]
  fetchedAt: Date
}) => ({
  week: averageRate(ratePoints, AVERAGE_WINDOW_DAYS.week, now),
  month: averageRate(ratePoints, AVERAGE_WINDOW_DAYS.month, now),
  year: averageRate(ratePoints, AVERAGE_WINDOW_DAYS.year, now),
  hasFullYear: hasFullTimeWindow(ratePoints, AVERAGE_WINDOW_DAYS.year, now),
})

export const MarketHistoricalRatesChart = ({ rateMode, timeOption, snapshots }: MarketHistoricalRatesChartProps) => {
  const { chainId, marketId, controllerAddress, apiMarket } = useMarketContext()
  const modeConfig = RATE_MODE_CONFIG[rateMode]
  const activeSeriesConfig = modeConfig.series
  const [visibleSeries, setVisibleSeries] = useState<RateSeriesKey[]>(() => activeSeriesConfig.map(({ key }) => key))
  const {
    design: { Color },
  } = useTheme()

  const marketRates = q(useMarketRates({ chainId, marketId }))
  const { rates: marketRatesData, fetchedAt: marketRatesFetchedAt } = marketRates.data ?? {}

  const ratePoints = useMappedQuery(
    snapshots,
    useCallback(
      ({ snapshots, fetchedAt }) => {
        const currentLiveRate = toRateNumber(modeConfig.getLiveRate(marketRatesData))
        const snapshotRatePoints = toSnapshotRatePoints(snapshots, modeConfig.getSnapshotRate)
        const snapshotsFetchedAt = new Date(fetchedAt)
        const ratesFetchedAt = maybe(marketRatesFetchedAt, fetchedAt => new Date(fetchedAt))
        return {
          fetchedAt: ratesFetchedAt && ratesFetchedAt > snapshotsFetchedAt ? ratesFetchedAt : snapshotsFetchedAt,
          points: sortBy(
            notFalsy(
              ...snapshotRatePoints,
              maybes([currentLiveRate, marketRatesFetchedAt], (currentLiveRate, fetchedAt) => ({
                timestamp: new Date(fetchedAt).getTime(),
                rate: currentLiveRate,
              })),
            ),
            item => item.timestamp,
          ),
        }
      },
      [modeConfig, marketRatesData, marketRatesFetchedAt],
    ),
  )

  const chartData = useMemo<RateChartPoint[]>(() => {
    if (!ratePoints.data) return []
    const cutoff = new Date(ratePoints.data.fetchedAt.getTime() - TIME_OPTION_MS[timeOption])
    return addMovingAverages(
      ratePoints.data.points.filter(({ timestamp }) => timestamp >= cutoff.getTime()),
      d => d.rate,
      d => d.timestamp,
    )
  }, [ratePoints.data, timeOption])

  const averageRates = useMappedQuery(ratePoints, getAverageRates)
  const showOneYearAverage = averageRates.isLoading || averageRates.data?.hasFullYear

  const seriesColors: Record<RateSeriesKey, string> = useMemo(
    () => ({ rate: Color.Primary[500], movingAverage: Color.Secondary[500], totalAverage: Color.Tertiary[400] }),
    [Color.Primary, Color.Secondary, Color.Tertiary],
  )

  const series: LineSeriesConfig<RateSeriesKey>[] = useMemo(
    () => activeSeriesConfig.map(({ key, label, dash }) => ({ key, label, color: seriesColors[key], dash })),
    [seriesColors, activeSeriesConfig],
  )

  const legendSets: LegendItem[] = useMemo(
    () =>
      activeSeriesConfig.map(({ key, label, dash }) => ({
        label,
        line: { lineStroke: seriesColors[key], dash },
        toggled: visibleSeries.includes(key),
        onToggle: () => setVisibleSeries(prev => (prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])),
      })),
    [seriesColors, visibleSeries, activeSeriesConfig],
  )

  return (
    <Card size="small" data-testid={`historical-${rateMode.toLowerCase()}-rate-chart`}>
      <CardContent component={Stack} sx={{ gap: Spacing.md }}>
        <MetricsGrid>
          <Metric
            category={METRIC_CATEGORY}
            label={modeConfig.currentRateLabel}
            value={fallbackQ(
              mapQuery(marketRates, ({ rates }) => toRateNumber(modeConfig.getLiveRate(rates))),
              mapQuery(apiMarket, market => toRateNumber(modeConfig.getApiRate(market))),
            )}
            valueOptions={{ unit: 'percentage' }}
            testId={`historical-${rateMode.toLowerCase()}-current-rate`}
          />
          <Metric
            category={METRIC_CATEGORY}
            label={modeConfig.averageRateLabels.week}
            value={mapQuery(averageRates, ({ week }) => week)}
            valueOptions={{ unit: 'percentage' }}
          />
          <Metric
            category={METRIC_CATEGORY}
            label={modeConfig.averageRateLabels.month}
            value={mapQuery(averageRates, ({ month }) => month)}
            valueOptions={{ unit: 'percentage' }}
          />
          {showOneYearAverage && (
            <Metric
              category={METRIC_CATEGORY}
              label={modeConfig.averageRateLabels.year}
              value={mapQuery(averageRates, ({ year }) => year)}
              valueOptions={{ unit: 'percentage' }}
            />
          )}
        </MetricsGrid>
        <EvmChartStateWrapper
          height={Height.chart.sm}
          isLoading={snapshots.isLoading || !controllerAddress}
          error={snapshots.error}
          errorMessage={t`Unable to fetch historical rates data.`}
        >
          <EChartsLineChart<RateChartPoint, RateSeriesKey, 'timestamp'>
            data={chartData}
            height={Height.chart.sm}
            xKey="timestamp"
            series={series}
            visibleSeries={visibleSeries}
            xTickFormatter={(value: RateChartPoint['timestamp'] | string) => formatDate(value)}
            yTickFormatter={value => formatNumber(decimal(value), 'percent.rate')}
            yPaddingRatio={0.05}
            renderTooltip={HistoricalRatesTooltip}
          />
        </EvmChartStateWrapper>
        <ChartFooter legendSets={legendSets} />
      </CardContent>
    </Card>
  )
}
