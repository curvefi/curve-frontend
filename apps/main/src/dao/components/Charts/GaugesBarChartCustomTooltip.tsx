import type { GaugeFormattedData } from '@/dao/types/dao.types'
import { useTheme } from '@mui/material/styles'
import { maybe } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import {
  ChartTooltipDataRow,
  ChartTooltipSeriesGroup,
  ChartTooltipShell,
  getChartSignedValueColor,
} from '@ui-kit/shared/ui/Chart'
import { formatNumber } from '@ui-kit/utils'

type GaugesBarChartCustomTooltipProps = {
  datum: GaugeFormattedData
}

type DeltaTooltipRowProps = {
  label: string
  value: number | null
}

const DeltaTooltipRow = ({ label, value }: DeltaTooltipRowProps) => {
  const theme = useTheme()

  return (
    maybe(value, value => (
      <ChartTooltipDataRow
        label={label}
        value={formatNumber(value, 'percent.value')}
        valueColor={value === 0 ? undefined : getChartSignedValueColor(theme, value)}
      />
    )) ?? <ChartTooltipDataRow label={label} value={t`N/A`} />
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
