import { sortBy } from 'lodash'
import { useCallback, useMemo, useState } from 'react'
import { Address } from 'viem'
import { useLlamaSnapshot } from '@/llamalend/queries/llamma-snapshots.query'
import { useMarketRates } from '@/llamalend/queries/market'
import { HistoricalRatesTooltip } from '@/llamalend/widgets/tooltips/chart/HistoricalRatesTooltip'
import type { Chain } from '@curvefi/prices-api'
import { CardContent, Stack } from '@mui/material'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import { useTheme } from '@mui/material/styles'
import type { Amount } from '@primitives/decimal.utils'
import { maybe, notFalsy } from '@primitives/objects.utils'
import { formatDate } from '@ui/utils'
import type { CrvUsdSnapshot } from '@ui-kit/entities/crvusd-snapshots'
import type { LendingSnapshot } from '@ui-kit/entities/lending-snapshots'
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
import { LlamaMarketType, MarketRateType } from '@ui-kit/types/market'
import { mapQuery, useMappedQuery } from '@ui-kit/types/util'
import { formatNumber } from '@ui-kit/utils'
import { calculateAverageRates } from '@ui-kit/utils/averageRates'

const { Spacing, Height } = SizesAndSpaces

export type RateChartPoint = {
  timestamp: number
  rate: number
  movingAverage: number
  totalAverage: number
}

type RateSeriesKey = 'rate' | 'movingAverage' | 'totalAverage'

type MarketRates = NonNullable<ReturnType<typeof useMarketRates>['data']>
type RateSnapshot = CrvUsdSnapshot | LendingSnapshot
type RateValue = Amount | null | undefined

type MarketHistoricalRatesChartProps = {
  controllerAddress: Address | undefined
  marketType: LlamaMarketType
  blockchainId: Chain | undefined
  chainId: number
  marketId: string | undefined
  rateMode: MarketRateType
}

type RateSeriesConfig = { key: RateSeriesKey; label: string; dash?: ChartLineDashPattern }
type RateModeConfig = {
  chartTitle: string
  currentRateLabel: string
  oneWeekAverageLabel: string
  series: RateSeriesConfig[]
  getLiveRate: (marketRates: MarketRates | undefined) => RateValue
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
    oneWeekAverageLabel: t`1W Avg APR`,
    series: [
      { key: 'rate', label: t`Borrow APR` },
      { key: 'movingAverage', label: t`7-day MA APR`, dash: CHART_LINE_DASH_PATTERNS.tight },
      { key: 'totalAverage', label: t`Average APR`, dash: CHART_LINE_DASH_PATTERNS.regular },
    ],
    getLiveRate: marketRates => marketRates?.borrowApr ?? null,
    getSnapshotRate: snapshot => snapshot.borrowApr,
  },
  [MarketRateType.Supply]: {
    chartTitle: t`Historical Supply Rate`,
    currentRateLabel: t`Current APY`,
    oneWeekAverageLabel: t`1W Avg APY`,
    series: [
      { key: 'rate', label: t`Supply APY` },
      { key: 'movingAverage', label: t`7-day MA APY`, dash: CHART_LINE_DASH_PATTERNS.tight },
      { key: 'totalAverage', label: t`Average APY`, dash: CHART_LINE_DASH_PATTERNS.regular },
    ],
    getLiveRate: marketRates => marketRates?.lendApy ?? null,
    getSnapshotRate: snapshot => ('lendApy' in snapshot ? snapshot.lendApy * 100 : null),
  },
} satisfies Record<MarketRateType, RateModeConfig>

const averageRates = (ratePoints: { rate: number; timestamp: number }[]) =>
  calculateAverageRates(ratePoints, 7, { rate: ({ rate }) => rate })?.rate

export const MarketHistoricalRatesChart = ({
  marketType,
  controllerAddress,
  blockchainId,
  chainId,
  marketId,
  rateMode,
}: MarketHistoricalRatesChartProps) => {
  const [timeOption, setTimeOption] = useState<TimeOption>('1M')
  const modeConfig = RATE_MODE_CONFIG[rateMode]
  const activeSeriesConfig = modeConfig.series
  const [visibleSeries, setVisibleSeries] = useState<RateSeriesKey[]>(() => activeSeriesConfig.map(({ key }) => key))
  const {
    design: { Color },
  } = useTheme()

  const marketRates = useMarketRates({ chainId, marketId })

  const snapshots = useLlamaSnapshot({
    controllerAddress,
    marketType,
    blockchainId,
    range: { kind: 'timeRange', timeOption },
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

  const chartData = useMemo<RateChartPoint[]>(
    () =>
      addMovingAverages(
        ratePoints.data ?? [],
        d => d.rate,
        d => d.timestamp,
      ),
    [ratePoints.data],
  )

  const oneWeekAverageRateQuery = useMappedQuery(ratePoints, averageRates)

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
      <CardHeader
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
            gridTemplateColumns: { mobile: 'repeat(2, 1fr)', tablet: 'repeat(4, 1fr)' },
          }}
        >
          <Metric
            size="medium"
            label={modeConfig.currentRateLabel}
            value={mapQuery(marketRates, marketRates => toRateNumber(modeConfig.getLiveRate(marketRates)))}
            valueOptions={{ unit: 'percentage' }}
          />
          <Metric
            size="medium"
            label={modeConfig.oneWeekAverageLabel}
            value={oneWeekAverageRateQuery}
            valueOptions={{ unit: 'percentage' }}
          />
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
