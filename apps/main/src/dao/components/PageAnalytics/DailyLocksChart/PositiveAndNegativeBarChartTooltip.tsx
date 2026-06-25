import type { VeCrvLock } from '@/dao/entities/vecrv-locks'
import { formatDate } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { ChartTooltipDataRow, ChartTooltipSeriesGroup, ChartTooltipShell } from '@ui-kit/shared/ui/Chart'
import { formatNumber } from '@ui-kit/utils'

export const PositiveAndNegativeBarChartTooltip = ({ datum }: { datum: VeCrvLock }) => (
  <ChartTooltipShell title={formatDate(datum.day)}>
    <ChartTooltipSeriesGroup>
      <ChartTooltipDataRow label={t`veCRV Locked`} value={formatNumber(datum.amount, 'token.compact')} />
    </ChartTooltipSeriesGroup>
  </ChartTooltipShell>
)
