import type { GaugeFormattedData } from '@/dao/types/dao.types'
import { useTheme } from '@mui/material/styles'
import { t } from '@evm-ui/lib/i18n'
import {
  ChartTooltipDataRow,
  ChartTooltipSeriesGroup,
  ChartTooltipShell,
  getChartSignedValueColor,
} from '@evm-ui/shared/ui/Chart'
import { formatNumber } from '@evm-ui/utils'

type GaugesBarChartCustomTooltipProps = {
  datum: GaugeFormattedData
}

type DeltaTooltipRowProps = {
  label: string
  value: number | null
}

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
      <ChartTooltipDataRow
        label={t`Relative Weight`}
        value={formatNumber(datum.gauge_relative_weight, 'percent.value')}
      />
      <DeltaTooltipRow label={t`Gauge weight 7d delta`} value={datum.gauge_relative_weight_7d_delta} />
      <DeltaTooltipRow label={t`Gauge weight 60d delta`} value={datum.gauge_relative_weight_60d_delta} />
    </ChartTooltipSeriesGroup>
  </ChartTooltipShell>
)
