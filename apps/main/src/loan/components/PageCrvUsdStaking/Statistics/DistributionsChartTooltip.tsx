import type { ScrvUsdRevenue } from '@/loan/entities/scrvusd-revenue.query'
import { formatDate } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { ChartTooltipDataRow, ChartTooltipSeriesGroup, ChartTooltipShell } from '@ui-kit/shared/ui/Chart'
import { formatNumber } from '@ui-kit/utils'

type Epoch = ScrvUsdRevenue['epochs'][number]

export const DistributionsChartTooltip = ({ datum }: { datum: Epoch }) => (
  <ChartTooltipShell title={formatDate(datum.endDate, 'long')}>
    <ChartTooltipSeriesGroup>
      <ChartTooltipDataRow label={t`Weekly Revenue`} value={formatNumber(datum.weeklyRevenue, 'usd.notional')} />
    </ChartTooltipSeriesGroup>
  </ChartTooltipShell>
)
