import { useGaugeWeightHistoryQuery, type GaugeWeightHistoryData } from '@/dao/entities/gauge-weight-history'
import { Stack } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import type { Address } from '@primitives/address.utils'
import { formatDate } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import {
  ChartFooter,
  ChartStateWrapper,
  ChartTooltipDataRow,
  ChartTooltipSeriesGroup,
  ChartTooltipShell,
  EChartsLineChart,
  type LegendItem,
  type LineSeriesConfig,
} from '@ui-kit/shared/ui/Chart'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'

const { Height, Spacing } = SizesAndSpaces
const SERIES_LABEL = t`Relative Gauge Weight`
const ERROR_MESSAGE = t`Unable to fetch historical gauge weights data.`

type GaugeWeightSeriesKey = 'weightRelative'

type GaugeWeightHistoryChartProps = {
  gaugeAddress: Address
  height?: number
}

export const GaugeWeightHistoryChart = ({ gaugeAddress, height = Height.chart }: GaugeWeightHistoryChartProps) => {
  const lineColor = useTheme().design.Chart.Lines[1]
  const {
    data = [],
    isLoading,
    isSuccess,
    error,
    refetch,
  } = useGaugeWeightHistoryQuery({
    gaugeAddress,
  })

  const series: LineSeriesConfig<GaugeWeightSeriesKey>[] = [
    { key: 'weightRelative', label: SERIES_LABEL, color: lineColor },
  ]
  const legendSets: LegendItem[] = [{ label: SERIES_LABEL, line: { lineStroke: lineColor } }]

  return (
    <Stack sx={{ flexGrow: 1, gap: Spacing.md }}>
      <ChartStateWrapper
        height={height}
        isLoading={isLoading}
        isEmpty={isSuccess && data.length === 0}
        error={error}
        errorMessage={ERROR_MESSAGE}
        refetchFunction={() => void refetch()}
      >
        <EChartsLineChart<GaugeWeightHistoryData, GaugeWeightSeriesKey, 'timestamp'>
          data={data}
          height={height}
          xKey="timestamp"
          series={series}
          xTickFormatter={value => formatDate(value)}
          yTickFormatter={value => formatNumber(+value, 'percent.value')}
          yPaddingRatio={0.1}
          renderTooltip={({ datum, visibleSeries }) => (
            <ChartTooltipShell title={formatDate(datum.timestamp, 'long')}>
              <ChartTooltipSeriesGroup>
                <ChartTooltipDataRow
                  label={t`Gauge Weight`}
                  value={formatNumber(datum.weight, { abbreviate: true, fallback: '-' })}
                />
                {visibleSeries.map(activeSeries => (
                  <ChartTooltipDataRow
                    key={activeSeries.key}
                    label={activeSeries.label}
                    value={formatNumber(datum[activeSeries.key], {
                      unit: 'percentage',
                      abbreviate: false,
                      fallback: '-',
                    })}
                  />
                ))}
                <ChartTooltipDataRow
                  label={t`Emissions (CRV)`}
                  value={formatNumber(datum.emissions, { abbreviate: true, fallback: '-' })}
                />
              </ChartTooltipSeriesGroup>
            </ChartTooltipShell>
          )}
        />
      </ChartStateWrapper>
      <ChartFooter legendSets={legendSets} />
    </Stack>
  )
}
