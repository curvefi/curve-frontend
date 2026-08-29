import { useMemo, useState } from 'react'
import type { Address } from 'viem'
import { usePoolSnapshots } from '@/dex/entities/pool-snapshots.query'
import { convertPoolRate } from '@/dex/features/pool-list/cells/utils'
import { usePoolPricesApi } from '@/dex/queries/pools-prices-api.query'
import type { Chain } from '@curvefi/prices-api'
import { useAprToApy, useRateDisplay } from '@evm-ui/hooks/useAprToApy'
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
import { mapQuery } from '@evm-ui/types/util'
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

type BaseRateSeriesKey = 'dailyBaseRate' | 'weeklyBaseRate'
type BaseRateChartPoint = {
  timestamp: number
  dailyBaseRate: number | undefined
  weeklyBaseRate: number | undefined
}
type BaseRateSeriesConfig = Omit<LineSeriesConfig<BaseRateSeriesKey>, 'color'>

const SERIES_KEYS: BaseRateSeriesKey[] = ['dailyBaseRate', 'weeklyBaseRate']

export const PoolHistoricalBaseRateChart = ({
  blockchainId,
  poolAddress,
}: {
  blockchainId: string
  poolAddress: Address
}) => {
  const convertAprToApy = useAprToApy()
  const rateDisplay = useRateDisplay()
  const [timeOption, setTimeOption] = useState<TimeOption>('1M')
  const [visibleSeries, setVisibleSeries] = useState<BaseRateSeriesKey[]>(SERIES_KEYS)
  const seriesConfig = useMemo<BaseRateSeriesConfig[]>(
    () => [
      { key: 'dailyBaseRate', label: rateDisplay === 'apy' ? t`Daily Base APY` : t`Daily Base APR` },
      {
        key: 'weeklyBaseRate',
        label: rateDisplay === 'apy' ? t`Weekly Base APY` : t`Weekly Base APR`,
        dash: CHART_LINE_DASH_PATTERNS.tight,
      },
    ],
    [rateDisplay],
  )

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
      dailyBaseRate: maybe(snapshot.baseDailyApr, apr => convertPoolRate(convertAprToApy, apr * 100)) ?? undefined,
      weeklyBaseRate: maybe(snapshot.baseWeeklyApr, apr => convertPoolRate(convertAprToApy, apr * 100)) ?? undefined,
    })),
  )

  // Current metric values are based on pool list data to avoid mismatches, and is also updated more frequently than snapshots
  const currentPool = usePoolPricesApi({ blockchainId: chain, poolAddress })

  const {
    design: { Color },
  } = useTheme()

  const seriesColors: Record<BaseRateSeriesKey, string> = useMemo(
    () => ({ dailyBaseRate: Color.Primary[500], weeklyBaseRate: Color.Secondary[500] }),
    [Color.Primary, Color.Secondary],
  )

  const series: LineSeriesConfig<BaseRateSeriesKey>[] = useMemo(
    () => seriesConfig.map(({ key, label, ...config }) => ({ key, label, color: seriesColors[key], ...config })),
    [seriesColors, seriesConfig],
  )

  const legendSets: LegendItem[] = useMemo(
    () =>
      seriesConfig.map(({ key, label, ...config }) => ({
        label,
        line: { lineStroke: seriesColors[key], ...config },
        toggled: visibleSeries.includes(key),
        onToggle: () =>
          setVisibleSeries(previous =>
            previous.includes(key) ? previous.filter(seriesKey => seriesKey !== key) : [...previous, key],
          ),
      })),
    [seriesColors, seriesConfig, visibleSeries],
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
            label={rateDisplay === 'apy' ? t`Current daily base APY` : t`Current daily base APR`}
            value={mapQuery(currentPool, pool => convertPoolRate(convertAprToApy, pool.baseDailyApr * 100))}
            valueOptions={{ unit: 'percentage' }}
          />
          <Metric
            category={METRIC_CATEGORY}
            label={rateDisplay === 'apy' ? t`Current weekly base APY` : t`Current weekly base APR`}
            value={mapQuery(currentPool, pool => convertPoolRate(convertAprToApy, pool.baseWeeklyApr * 100))}
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
        </ChartStateWrapper>
        <ChartFooter legendSets={legendSets} />
      </CardContent>
    </Card>
  )
}
