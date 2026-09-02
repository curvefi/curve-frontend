import { useMemo, useState } from 'react'
import { usePoolSnapshots } from '@/dex/entities/pool-snapshots.query'
import { aprToPoolApy } from '@/dex/features/pool-list/cells/utils'
import { usePoolPricesApi } from '@/dex/queries/pools-prices-api.query'
import type { PoolDataCacheOrApi } from '@/dex/types/main.types'
import { getPoolAddress } from '@/dex/utils'
import type { Chain } from '@curvefi/prices-api'
import { combineQueries } from '@evm-ui/lib'
import { t } from '@evm-ui/lib/i18n'
import { type TimeOption, timeOptions } from '@evm-ui/lib/model/query/time-option-validation'
import {
  CHART_LINE_DASH_PATTERNS,
  ChartFooter,
  ChartStateWrapper,
  ChartTooltipSeriesGroup,
  ChartTooltipSeriesRow,
  ChartTooltipShell,
  EChartsLineChart,
  type LegendItem,
  type LineSeriesConfig,
  SelectTimeOption,
} from '@evm-ui/shared/ui/Chart'
import { Metric } from '@evm-ui/shared/ui/Metric'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { mapQuery, type QueryProp } from '@evm-ui/types/util'
import { decimal, formatNumber, TIME_OPTION_MS } from '@evm-ui/utils'
import { formatDate } from '@legacy-ui/utils'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { maybe } from '@primitives/objects.utils'

const { Height, Spacing } = SizesAndSpaces

const METRIC_CATEGORY = 'dex.poolInformation'

type BaseRateSeriesKey = 'dailyBaseApy' | 'weeklyBaseApy'
type BaseRateChartPoint = {
  timestamp: number
  dailyBaseApy: number | undefined
  weeklyBaseApy: number | undefined
}

const SERIES_CONFIG = [
  { key: 'dailyBaseApy', label: t`Daily Base APY` },
  { key: 'weeklyBaseApy', label: t`Weekly Base APY`, dash: CHART_LINE_DASH_PATTERNS.tight },
] as const

export const PoolHistoricalBaseRateChart = ({
  blockchainId,
  poolQuery,
}: {
  blockchainId: string
  poolQuery: QueryProp<PoolDataCacheOrApi | undefined>
}) => {
  const poolAddress = getPoolAddress(poolQuery.data)
  const [timeOption, setTimeOption] = useState<TimeOption>('1M')
  const [visibleSeries, setVisibleSeries] = useState<BaseRateSeriesKey[]>(() => SERIES_CONFIG.map(({ key }) => key))

  const chain = blockchainId as Chain
  const [end] = useState(() => Math.floor(Date.now() / 1000))
  const snapshots = usePoolSnapshots({
    chain,
    poolAddress,
    start: end - TIME_OPTION_MS[timeOption] / 1000,
    end,
    unit: 'day',
  })

  const ratePoints = mapQuery(snapshots, snapshots =>
    snapshots.toReversed().map(snapshot => ({
      timestamp: snapshot.timestamp,
      dailyBaseApy: maybe(snapshot.baseDailyApr, apr => aprToPoolApy(apr * 100)) ?? undefined,
      weeklyBaseApy: maybe(snapshot.baseWeeklyApr, apr => aprToPoolApy(apr * 100)) ?? undefined,
    })),
  )

  // Current metric values are based on pool list data to avoid mismatches, and is also updated more frequently than snapshots
  const currentPool = usePoolPricesApi({ blockchainId: chain, poolAddress })
  const currentDailyBaseApy = combineQueries([poolQuery, currentPool], (_pool, pool) =>
    aprToPoolApy(pool.baseDailyApr * 100),
  )
  const currentWeeklyBaseApy = combineQueries([poolQuery, currentPool], (_pool, pool) =>
    aprToPoolApy(pool.baseWeeklyApr * 100),
  )

  const {
    design: { Color },
  } = useTheme()

  const seriesColors: Record<BaseRateSeriesKey, string> = useMemo(
    () => ({ dailyBaseApy: Color.Primary[500], weeklyBaseApy: Color.Secondary[500] }),
    [Color.Primary, Color.Secondary],
  )

  const series: LineSeriesConfig<BaseRateSeriesKey>[] = useMemo(
    () => SERIES_CONFIG.map(({ key, label, ...config }) => ({ key, label, color: seriesColors[key], ...config })),
    [seriesColors],
  )

  const legendSets: LegendItem[] = useMemo(
    () =>
      SERIES_CONFIG.map(({ key, label, ...config }) => ({
        label,
        line: { lineStroke: seriesColors[key], ...config },
        toggled: visibleSeries.includes(key),
        onToggle: () =>
          setVisibleSeries(previous =>
            previous.includes(key) ? previous.filter(seriesKey => seriesKey !== key) : [...previous, key],
          ),
      })),
    [seriesColors, visibleSeries],
  )

  return (
    <Card size="small">
      <CardHeader
        title={t`Historical Base Rate`}
        action={
          <SelectTimeOption
            options={timeOptions}
            activeOption={timeOption}
            setActiveOption={setTimeOption}
            isLoading={poolQuery.isLoading || snapshots.isLoading}
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
            label={t`Current daily base APY`}
            value={currentDailyBaseApy}
            valueOptions={{ unit: 'percentage' }}
          />
          <Metric
            category={METRIC_CATEGORY}
            label={t`Current weekly base APY`}
            value={currentWeeklyBaseApy}
            valueOptions={{ unit: 'percentage' }}
          />
        </Stack>
        <ChartStateWrapper
          height={Height.shortChart}
          isLoading={poolQuery.isLoading || ratePoints.isLoading}
          isEmpty={ratePoints.data == null || ratePoints.data.length === 0}
          error={ratePoints.error}
          errorMessage={t`Unable to fetch historical base rate data.`}
        >
          {ratePoints.data && (
            <EChartsLineChart<BaseRateChartPoint, BaseRateSeriesKey, 'timestamp'>
              data={ratePoints.data}
              height={Height.shortChart}
              xKey="timestamp"
              series={series}
              visibleSeries={visibleSeries}
              xTickFormatter={value => formatDate(value)}
              yTickFormatter={value => formatNumber(decimal(value), 'percent.rate')}
              yPaddingRatio={0.05}
              renderTooltip={({ datum, visibleSeries: activeSeries }) => (
                <ChartTooltipShell title={formatDate(datum.timestamp, 'long')}>
                  <ChartTooltipSeriesGroup>
                    {activeSeries.map(activeSeriesItem => (
                      <ChartTooltipSeriesRow
                        key={activeSeriesItem.key}
                        label={activeSeriesItem.label}
                        lineColor={activeSeriesItem.color}
                        dash={activeSeriesItem.dash}
                        value={formatNumber(datum[activeSeriesItem.key], 'percent.rate')}
                      />
                    ))}
                  </ChartTooltipSeriesGroup>
                </ChartTooltipShell>
              )}
            />
          )}
        </ChartStateWrapper>
        <ChartFooter legendSets={legendSets} />
      </CardContent>
    </Card>
  )
}
