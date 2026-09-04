import type { VeCrvLock } from '@/dao/entities/vecrv-locks'
import { ChartTooltipDataRow, ChartTooltipSeriesGroup, ChartTooltipShell } from '@evm-ui/shared/ui/Chart'
import { formatNumber } from '@evm-ui/utils'
import { formatDate } from '@legacy-ui/utils'
import { t } from '@ui/lib/i18n'

export const PositiveAndNegativeBarChartTooltip = ({ datum }: { datum: VeCrvLock }) => (
  <ChartTooltipShell title={formatDate(datum.day)}>
    <ChartTooltipSeriesGroup>
      <ChartTooltipDataRow label={t`veCRV Locked`} value={formatNumber(datum.amount, 'token.compact')} />
    </ChartTooltipSeriesGroup>
  </ChartTooltipShell>
)
