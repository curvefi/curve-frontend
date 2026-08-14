import { sortBy } from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import { type MarketRates, useMarketRates, useMarketSnapshots } from '@/llamalend/queries/market'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { HistoricalRatesTooltip } from '@/llamalend/widgets/tooltips/chart/HistoricalRatesTooltip'
import { CardContent, Stack } from '@mui/material'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { useTheme } from '@mui/material/styles'
import type { Amount } from '@primitives/decimal.utils'
import { maybe, notFalsy } from '@primitives/objects.utils'
import { formatDate } from '@ui/utils'
import type { CrvUsdSnapshot } from '@ui-kit/entities/crvusd-snapshots'
import type { LendingSnapshot } from '@ui-kit/entities/lending-snapshots'
import { useNewLlamaMarketDetailPage } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { type TimeOption, timeOptions } from '@ui-kit/lib/model/query/time-option-validation'
import {
  addMovingAverages,
  CHART_LINE_DASH_PATTERNS,
  ChartFooter,
  type ChartLineDashPattern,
  ChartStateWrapper,
  EChartsLineChart,
  type LegendItem,
  type LineSeriesConfig,
  SelectTimeOption,
} from '@ui-kit/shared/ui/Chart'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { MarketRateType } from '@ui-kit/types/market'
import { fallbackQ, mapQuery, q, useMappedQuery } from '@ui-kit/types/util'
import { formatNumber, TIME_OPTION_MS } from '@ui-kit/utils'
import { AVERAGE_WINDOW_DAYS, calculateAverageRates, hasFullTimeWindow } from '@ui-kit/utils/averageRates'
import { useMarketContext } from '../features/market-context'
import { MarketCardHeader } from './MarketCardHeader'

const { Spacing, Height } = SizesAndSpaces

const METRIC_CATEGORY = 'llamalend.marketCharts'

export type RateChartPoint = {
  timestamp: number
  rate: number
  movingAverage: number
  totalAverage: number
}

type RateSeriesKey = 'rate' | 'movingAverage' | 'totalAverage'

type RateSnapshot = CrvUsdSnapshot | LendingSnapshot
type RateValue = Amount | null | undefined

type MarketHistoricalRatesChartProps = {
  rateMode: MarketRateType
}

type RateSeriesConfig = { key: RateSeriesKey; label: string; dash?: ChartLineDashPattern }
type RateModeConfig = {
  chartTitle: string
  currentRateLabel: string
  averageRateLabels: {
    week: string
    month: string
    year: string
  }
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
    chartTitle: t`Historical Borrow Rate`,
    currentRateLabel: t`Current APR`,
    averageRateLabels: {
      week: t`1W average APR`,
      month: t`1M average APR`,
      year: t`1Y average APR`,
    },
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
    chartTitle: t`Historical Supply Rate`,
    currentRateLabel: t`Current APY`,
    averageRateLabels: {
      week: t`1W average APY`,
      month: t`1M average APY`,
      year: t`1Y average APY`,
    },
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

const averageRate = (ratePoints: { rate: number; timestamp: number }[], days: number) =>
  calculateAverageRates(ratePoints, days, { rate: ({ rate }) => rate })?.rate

const getAverageRates = (ratePoints: { rate: number; timestamp: number }[]) => ({
  week: averageRate(ratePoints, AVERAGE_WINDOW_DAYS.week),
  month: averageRate(ratePoints, AVERAGE_WINDOW_DAYS.month),
  year: averageRate(ratePoints, AVERAGE_WINDOW_DAYS.year),
  hasFullYear: hasFullTimeWindow(ratePoints, AVERAGE_WINDOW_DAYS.year),
})

export const MarketHistoricalRatesChart = ({ rateMode }: MarketHistoricalRatesChartProps) => {
  const Header = useNewLlamaMarketDetailPage() ? MarketCardHeader : CardHeader
  const { chainId, blockchainId, marketId, controllerAddress, marketType, apiMarket } = useMarketContext()
  const [timeOption, setTimeOption] = useState<TimeOption>('1M')
  const modeConfig = RATE_MODE_CONFIG[rateMode]
  const activeSeriesConfig = modeConfig.series
  const [visibleSeries, setVisibleSeries] = useState<RateSeriesKey[]>(() => activeSeriesConfig.map(({ key }) => key))
  const {
    design: { Color },
  } = useTheme()

  const marketRates = q(useMarketRates({ chainId, marketId }))

  const snapshots = useMarketSnapshots({
    controllerAddress,
    marketType,
    blockchainId,
    range: { kind: 'timeRange', timeOption: '1Y' },
  })

  const ratePoints = useMappedQuery(
    snapshots,
    useCallback(
      snapshots => {
        const currentLiveRate = toRateNumber(modeConfig.getLiveRate(marketRates.data))
        const snapshotRatePoints = toSnapshotRatePoints(snapshots, modeConfig.getSnapshotRate)
        return sortBy(
          notFalsy(...snapshotRatePoints, currentLiveRate != null && { timestamp: Date.now(), rate: currentLiveRate }),
          item => item.timestamp,
        )
      },
      [modeConfig, marketRates.data],
    ),
  )

  const chartData = useMemo<RateChartPoint[]>(() => {
    const cutoff = Date.now() - TIME_OPTION_MS[timeOption]
    return addMovingAverages(
      (ratePoints.data ?? []).filter(({ timestamp }) => timestamp >= cutoff),
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
      <Header
        title={modeConfig.chartTitle}
        action={
          <SelectTimeOption
            options={timeOptions}
            activeOption={timeOption}
            setActiveOption={setTimeOption}
            isLoading={snapshots.isLoading || !controllerAddress}
          />
        }
      />
      <CardContent component={Stack} sx={{ gap: Spacing.md }}>
        <Stack
          sx={{
            display: 'grid',
            gap: Spacing.xl,
            gridTemplateColumns: { mobile: 'repeat(2, 1fr)', tablet: 'repeat(5, 1fr)' },
          }}
        >
          <Metric
            category={METRIC_CATEGORY}
            label={modeConfig.currentRateLabel}
            value={fallbackQ(
              mapQuery(marketRates, marketRates => toRateNumber(modeConfig.getLiveRate(marketRates))),
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
        </Stack>
        <ChartStateWrapper
          height={Height.shortChart}
          isLoading={snapshots.isLoading || !controllerAddress}
          error={snapshots.error}
          errorMessage={t`Unable to fetch historical rates data.`}
        >
          <EChartsLineChart<RateChartPoint, RateSeriesKey, 'timestamp'>
            data={chartData}
            height={Height.shortChart}
            xKey="timestamp"
            series={series}
            visibleSeries={visibleSeries}
            xTickFormatter={(value: RateChartPoint['timestamp'] | string) => formatDate(value)}
            yTickFormatter={value => formatNumber(+value, { unit: 'percentage', abbreviate: false, decimals: 2 })}
            yPaddingRatio={0.05}
            renderTooltip={HistoricalRatesTooltip}
          />
        </ChartStateWrapper>
        <ChartFooter legendSets={legendSets} />
      </CardContent>
    </Card>
  )
}
