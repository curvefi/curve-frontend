import type { ScrvUsdRevenue } from '@/loan/entities/scrvusd-revenue.query'
import { ChartTooltipDataRow, ChartTooltipSeriesGroup, ChartTooltipShell } from '@evm-ui/shared/ui/Chart'
import { formatDate } from '@legacy-ui/utils'
import { formatNumber } from '@primitives/number.utils'
import { t } from '@ui/lib/i18n'

type Epoch = ScrvUsdRevenue['epochs'][number]

export const DistributionsChartTooltip = ({ datum }: { datum: Epoch }) => (
  <ChartTooltipShell title={formatDate(datum.endDate, 'long')}>
    <ChartTooltipSeriesGroup>
      <ChartTooltipDataRow label={t`Weekly Revenue`} value={formatNumber(datum.weeklyRevenue, 'usd.notional')} />
    </ChartTooltipSeriesGroup>
  </ChartTooltipShell>
)
