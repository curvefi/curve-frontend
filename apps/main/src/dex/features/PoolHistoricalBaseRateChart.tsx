import { useMemo, useState } from 'react'
import type { Address } from 'viem'
import { usePoolSnapshots } from '@/dex/entities/pool-snapshots.query'
import { aprToPoolApy } from '@/dex/features/pool-list/cells/utils'
import { usePoolsPricesApi } from '@/dex/queries/pools-prices-api.query'
import type { Chain } from '@curvefi/prices-api'
import { formatDate } from '@legacy-ui/utils'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { maybe } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { type TimeOption, timeOptions } from '@ui-kit/lib/model/query/time-option-validation'
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
} from '@ui-kit/shared/ui/Chart'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { mapQuery } from '@ui-kit/types/util'
import { decimal, formatNumber, TIME_OPTION_MS } from '@ui-kit/utils'

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
  poolAddress,
}: {
  blockchainId: string
  poolAddress: Address
}) => {
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
  const currentPool = mapQuery(usePoolsPricesApi({ blockchainId: chain }), pools => pools[poolAddress.toLowerCase()])

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
            isLoading={snapshots.isLoading}
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
            value={mapQuery(currentPool, pool => aprToPoolApy(pool.baseDailyApr * 100))}
            valueOptions={{ unit: 'percentage' }}
          />
          <Metric
            category={METRIC_CATEGORY}
            label={t`Current weekly base APY`}
            value={mapQuery(currentPool, pool => aprToPoolApy(pool.baseWeeklyApr * 100))}
            valueOptions={{ unit: 'percentage' }}
          />
        </Stack>
        <ChartStateWrapper
          height={Height.shortChart}
          isLoading={ratePoints.isLoading}
          error={ratePoints.error}
          errorMessage={t`Unable to fetch historical base rate data.`}
        >
          <EChartsLineChart<BaseRateChartPoint, BaseRateSeriesKey, 'timestamp'>
            data={ratePoints.data ?? []}
            height={Height.shortChart}
            xKey="timestamp"
            series={series}
            visibleSeries={visibleSeries}
            xTickFormatter={value => formatDate(value)}
            yTickFormatter={value => formatNumber(decimal(value), 'percent.value')}
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
                      value={formatNumber(datum[activeSeriesItem.key], 'percent.value')}
                    />
                  ))}
                </ChartTooltipSeriesGroup>
              </ChartTooltipShell>
            )}
          />
        </ChartStateWrapper>
        <ChartFooter legendSets={legendSets} />
      </CardContent>
    </Card>
  )
}
