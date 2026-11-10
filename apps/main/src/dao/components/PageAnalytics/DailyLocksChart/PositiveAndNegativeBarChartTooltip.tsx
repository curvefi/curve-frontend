import type { VeCrvLock } from '@/dao/entities/vecrv-locks'
import { formatDate } from '@primitives/date.utils'
import { formatNumber } from '@primitives/number.utils'
import {
  ChartTooltipDataRow,
  ChartTooltipSeriesGroup,
  ChartTooltipShell,
} from '@ui/features/charts/ChartTooltipComponents'
import { t } from '@ui/lib/i18n'

export const PositiveAndNegativeBarChartTooltip = ({ datum }: { datum: VeCrvLock }) => (
  <ChartTooltipShell title={formatDate(datum.day)}>
    <ChartTooltipSeriesGroup>
      <ChartTooltipDataRow label={t`veCRV Locked`} value={formatNumber(datum.amount, 'token.compact')} />
    </ChartTooltipSeriesGroup>
  </ChartTooltipShell>
)
