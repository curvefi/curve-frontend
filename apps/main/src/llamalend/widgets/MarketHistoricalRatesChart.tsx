import { sortBy } from 'lodash'
import { useMemo, useState } from 'react'
import { type LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { useLlamaSnapshot } from '@/llamalend/queries/llamma-snapshots.query'
import { useMarketRates } from '@/llamalend/queries/market'
import { HistoricalRatesTooltip } from '@/llamalend/widgets/tooltips/chart/HistoricalRatesTooltip'
import type { Chain } from '@curvefi/prices-api'
import { CardContent, Stack } from '@mui/material'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { useTheme } from '@mui/material/styles'
import { notFalsy } from '@primitives/objects.utils'
import { formatDate } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { timeOptions, type TimeOption } from '@ui-kit/lib/model/query/time-option-validation'
import { TIME_FRAMES } from '@ui-kit/lib/model/time'
import {
  ChartStateWrapper,
  ChartFooter,
  type LegendItem,
  addMovingAverages,
  CHART_LINE_DASH_PATTERNS,
  EChartsLineChart,
  type ChartLineDashPattern,
  type LineSeriesConfig,
  SelectTimeOption,
} from '@ui-kit/shared/ui/Chart'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'

const { Spacing, Height } = SizesAndSpaces
const WEEK_MS = 7 * TIME_FRAMES.DAY_MS

type RateMode = 'borrow' | 'supply'

export type RateChartPoint = {
  timestamp: number
  rate: number
  movingAverage: number
  totalAverage: number
}

type RateSeriesKey = 'rate' | 'movingAverage' | 'totalAverage'

type MarketHistoricalRatesChartProps = {
  market: LlamaMarketTemplate | undefined | null
  blockchainId: Chain | undefined
  chainId: number
  marketId: string
  rateMode: RateMode
}

type RateMetricPoint = Pick<RateChartPoint, 'timestamp' | 'rate'>

const BORROW_SERIES_CONFIG: { key: RateSeriesKey; label: string; dash?: ChartLineDashPattern }[] = [
  { key: 'rate', label: t`Borrow APR` },
  { key: 'movingAverage', label: t`7-day MA APR`, dash: CHART_LINE_DASH_PATTERNS.tight },
  { key: 'totalAverage', label: t`Average APR`, dash: CHART_LINE_DASH_PATTERNS.regular },
]

const SUPPLY_SERIES_CONFIG: { key: RateSeriesKey; label: string; dash?: ChartLineDashPattern }[] = [
  { key: 'rate', label: t`Supply APY` },
  { key: 'movingAverage', label: t`7-day MA APY`, dash: CHART_LINE_DASH_PATTERNS.tight },
  { key: 'totalAverage', label: t`Average APY`, dash: CHART_LINE_DASH_PATTERNS.regular },
]

export const MarketHistoricalRatesChart = ({
  market,
  blockchainId,
  chainId,
  marketId,
  rateMode,
}: MarketHistoricalRatesChartProps) => {
  const [timeOption, setTimeOption] = useState<TimeOption>('1M')
  const activeSeriesConfig = rateMode === 'borrow' ? BORROW_SERIES_CONFIG : SUPPLY_SERIES_CONFIG
  const [visibleSeries, setVisibleSeries] = useState<RateSeriesKey[]>(activeSeriesConfig.map(({ key }) => key))
  const {
    design: { Color },
  } = useTheme()

  const { data: marketRates, isLoading: isMarketRatesLoading } = useMarketRates({ chainId, marketId })

  const {
    data: snapshots = [],
    isLoading: isSnapshotsLoading,
    error,
  } = useLlamaSnapshot(market, blockchainId, Boolean(market && blockchainId), { kind: 'timeRange', timeOption })

  const currentLiveRate = useMemo(() => {
    const liveRate = rateMode === 'borrow' ? marketRates?.borrowApr : marketRates?.lendApy
    const numericRate = Number(liveRate)

    return Number.isFinite(numericRate) ? numericRate : null
  }, [marketRates?.borrowApr, marketRates?.lendApy, rateMode])

  const chartData = useMemo<RateChartPoint[]>(() => {
    const onChainRate = rateMode === 'borrow' ? marketRates?.borrowApr : marketRates?.lendApy
    const sorted = sortBy(
      notFalsy(
        ...snapshots.map(snapshot => ({
          timestamp: snapshot.timestamp,
          rate: Number(rateMode === 'borrow' ? snapshot.borrowApr : 'lendApy' in snapshot ? snapshot.lendApy * 100 : 0),
        })),
        onChainRate != null && { timestamp: Date.now(), rate: Number(onChainRate) },
      ),
      item => item.timestamp,
    )

    return addMovingAverages(
      sorted,
      d => d.rate,
      d => d.timestamp,
    )
  }, [snapshots, rateMode, marketRates])

  const oneWeekAverageRate = useMemo(() => {
    const now = Date.now()
    const cutoff = now - WEEK_MS
    const snapshotPoints = snapshots.map<RateMetricPoint>(snapshot => {
      const timestamp = new Date(snapshot.timestamp).getTime()
      const snapshotRate =
        rateMode === 'borrow' ? snapshot.borrowApr : 'lendApy' in snapshot ? snapshot.lendApy * 100 : null
      const rate = Number(snapshotRate)

      return { timestamp, rate }
    })
    const weeklyPoints = [
      ...snapshotPoints,
      ...(currentLiveRate == null ? [] : [{ timestamp: now, rate: currentLiveRate }]),
    ].filter(({ timestamp, rate }) => timestamp >= cutoff && timestamp <= now && Number.isFinite(rate))

    if (weeklyPoints.length === 0) return null

    return weeklyPoints.reduce((sum, { rate }) => sum + rate, 0) / weeklyPoints.length
  }, [currentLiveRate, snapshots, rateMode])

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
    <Card size="small">
      <CardHeader
        title={rateMode === 'borrow' ? t`Historical Borrow Rate` : t`Historical Supply Rate`}
        action={
          <SelectTimeOption
            options={timeOptions}
            activeOption={timeOption}
            setActiveOption={setTimeOption}
            isLoading={isSnapshotsLoading || !market}
          />
        }
      />
      <CardContent component={Stack} gap={Spacing.md}>
        <Stack direction="row" gap={Spacing.xl} flexWrap="wrap">
          <Metric
            size="small"
            label={rateMode === 'borrow' ? t`Current APR` : t`Current APY`}
            value={currentLiveRate}
            loading={currentLiveRate == null && (isMarketRatesLoading || !market)}
            valueOptions={{ unit: 'percentage' }}
          />
          <Metric
            size="small"
            label={rateMode === 'borrow' ? t`1W Avg APR` : t`1W Avg APY`}
            value={oneWeekAverageRate}
            loading={oneWeekAverageRate == null && (isSnapshotsLoading || isMarketRatesLoading || !market)}
            valueOptions={{ unit: 'percentage' }}
          />
        </Stack>
        <ChartStateWrapper
          height={Height.shortChart}
          isLoading={isSnapshotsLoading || !market}
          error={error}
          errorMessage={t`Unable to fetch historical rates data.`}
        >
          <EChartsLineChart<RateChartPoint, RateSeriesKey, 'timestamp'>
            data={chartData}
            height={Height.shortChart}
            xKey="timestamp"
            series={series}
            visibleSeries={visibleSeries}
            xTickFormatter={(value: RateChartPoint['timestamp'] | number | string) => formatDate(value)}
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
