import { useGaugeWeightHistoryQuery, type GaugeWeightHistoryData } from '@/dao/entities/gauge-weight-history'
import { ChartFooter } from '@evm-ui/shared/ui/Chart/ChartFooter'
import {
  ChartTooltipDataRow,
  ChartTooltipSeriesGroup,
  ChartTooltipShell,
} from '@evm-ui/shared/ui/Chart/ChartTooltipComponents'
import { EChartsLineChart, type LineSeriesConfig } from '@evm-ui/shared/ui/Chart/EChartsLineChart'
import { EvmChartStateWrapper } from '@evm-ui/shared/ui/Chart/EvmChartStateWrapper'
import type { LegendItem } from '@evm-ui/shared/ui/Chart/LegendSet'
import { Stack } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import type { Address } from '@primitives/address.utils'
import { formatDate } from '@primitives/date.utils'
import { formatNumber } from '@primitives/number.utils'
import { q } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { Height, Spacing } = SizesAndSpaces
const SERIES_LABEL = t`Relative Gauge Weight`
const ERROR_MESSAGE = t`Unable to fetch historical gauge weights data.`

type GaugeWeightSeriesKey = 'weightRelative'

type GaugeWeightHistoryChartProps = { gaugeAddress: Address; height?: number }

export const GaugeWeightHistoryChart = ({ gaugeAddress, height = Height.chart.lg }: GaugeWeightHistoryChartProps) => {
  const lineColor = useTheme().design.Chart.Lines[1]
  const history = useGaugeWeightHistoryQuery({ gaugeAddress })

  const series: LineSeriesConfig<GaugeWeightSeriesKey>[] = [
    { key: 'weightRelative', label: SERIES_LABEL, color: lineColor },
  ]
  const legendSets: LegendItem[] = [{ label: SERIES_LABEL, line: { lineStroke: lineColor } }]

  return (
    <Stack sx={{ flexGrow: 1, gap: Spacing.md }}>
      <EvmChartStateWrapper
        query={q(history)}
        height={height}
        isEmpty={history.data?.length === 0}
        errorState={{ description: ERROR_MESSAGE, onReload: () => void history.refetch() }}
      >
        {data => (
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
        )}
      </EvmChartStateWrapper>
      <ChartFooter legendSets={legendSets} />
    </Stack>
  )
}
