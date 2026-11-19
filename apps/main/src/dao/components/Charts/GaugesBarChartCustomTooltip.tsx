import type { GaugeFormattedData } from '@/dao/types/dao.types'
import { useTheme } from '@mui/material/styles'
import { formatNumber } from '@primitives/number.utils'
import { getChartSignedValueColor } from '@ui/features/charts/chart.utils'
import {
  ChartTooltipDataRow,
  ChartTooltipSeriesGroup,
  ChartTooltipShell,
} from '@ui/features/charts/ChartTooltipComponents'
import { t } from '@ui/lib/i18n'

type GaugesBarChartCustomTooltipProps = { datum: GaugeFormattedData }

type DeltaTooltipRowProps = { label: string; value: number | undefined }

const DeltaTooltipRow = ({ label, value }: DeltaTooltipRowProps) => {
  const theme = useTheme()

  return value == null ? (
    <ChartTooltipDataRow label={label} value={t`N/A`} />
  ) : (
    <ChartTooltipDataRow
      label={label}
      value={formatNumber(value, 'percent.value')}
      valueColor={value === 0 ? undefined : getChartSignedValueColor(theme, value)}
    />
  )
}

export const GaugesBarChartCustomTooltip = ({ datum }: GaugesBarChartCustomTooltipProps) => (
  <ChartTooltipShell title={datum.title}>
    <ChartTooltipSeriesGroup>
      <ChartTooltipDataRow label={t`Relative Weight`} value={formatNumber(datum.weightRelative, 'percent.value')} />
      <DeltaTooltipRow label={t`Gauge weight 7d delta`} value={datum.weightRelativeDelta7d} />
      <DeltaTooltipRow label={t`Gauge weight 60d delta`} value={datum.weightRelativeDelta60d} />
    </ChartTooltipSeriesGroup>
  </ChartTooltipShell>
)
