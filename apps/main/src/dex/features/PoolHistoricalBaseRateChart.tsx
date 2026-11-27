import { useMemo, useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import type { Address } from '@primitives/address.utils'
import { formatDate } from '@primitives/date.utils'
import { formatNumber } from '@primitives/number.utils'
import { Metric } from '@ui/components/Metric'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { CHART_LINE_DASH_PATTERNS } from '@ui/features/charts/chart.utils'
import { ChartFooter } from '@ui/features/charts/ChartFooter'
import { ChartSelect, type ChartSelectOptions } from '@ui/features/charts/ChartSelect'
import { ChartStateWrapper } from '@ui/features/charts/ChartStateWrapper'
import {
  ChartTooltipSeriesGroup,
  ChartTooltipSeriesRow,
  ChartTooltipShell,
} from '@ui/features/charts/ChartTooltipComponents'
import { EChartsLineChart, type LineSeriesConfig } from '@ui/features/charts/EChartsLineChart'
import type { LegendItem } from '@ui/features/charts/LegendSet'
import type { QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { decimal } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'

const { Height, Spacing } = SizesAndSpaces

const CHART_HEIGHT = Height.chart.sm
const METRIC_CATEGORY = 'dex.poolInformation'

type BaseRateSeriesKey = 'dailyBaseRate' | 'weeklyBaseRate'
/** Chronological points with timestamps in milliseconds and APRs in percent (5 = 5%). */
export type BaseRateChartPoint = {
  timestamp: number
  dailyBaseRate: number | undefined
  weeklyBaseRate: number | undefined
}

const SERIES_CONFIG = [
  { key: 'dailyBaseRate', label: t`Daily Base APR` },
  { key: 'weeklyBaseRate', label: t`Weekly Base APR`, dash: CHART_LINE_DASH_PATTERNS.tight },
] as const

export const PoolHistoricalBaseRateChart = <TTimeOption extends string>({
  ratePoints,
  dailyBaseRate,
  weeklyBaseRate,
  timeOption,
  userAddress,
}: {
  ratePoints: QueryProp<BaseRateChartPoint[]>
  dailyBaseRate: QueryProp<number | null>
  weeklyBaseRate: QueryProp<number | null>
  timeOption: ChartSelectOptions<TTimeOption>
  userAddress: Address | undefined
}) => {
  const [visibleSeries, setVisibleSeries] = useState<BaseRateSeriesKey[]>(() => SERIES_CONFIG.map(({ key }) => key))
  const {
    design: { Color },
  } = useTheme()

  const seriesColors: Record<BaseRateSeriesKey, string> = useMemo(
    () => ({ dailyBaseRate: Color.Primary[500], weeklyBaseRate: Color.Secondary[500] }),
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
        action={<ChartSelect {...timeOption} isLoading={ratePoints.isLoading} />}
      />
      <CardContent component={Stack} sx={{ gap: Spacing.md }}>
        <MetricsGrid>
          <Metric
            category={METRIC_CATEGORY}
            label={t`Current daily base APR`}
            value={dailyBaseRate}
            valueOptions={{ unit: 'percentage' }}
          />
          <Metric
            category={METRIC_CATEGORY}
            label={t`Current weekly base APR`}
            value={weeklyBaseRate}
            valueOptions={{ unit: 'percentage' }}
          />
        </MetricsGrid>
        <ChartStateWrapper
          query={ratePoints}
          height={CHART_HEIGHT}
          errorState={{ description: t`Unable to fetch historical base rate data.` }}
          userAddress={userAddress}
        >
          {data => (
            <EChartsLineChart<BaseRateChartPoint, BaseRateSeriesKey, 'timestamp'>
              data={data}
              height={CHART_HEIGHT}
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
