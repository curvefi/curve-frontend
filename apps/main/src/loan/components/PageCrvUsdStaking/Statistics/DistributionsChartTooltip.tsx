import { TooltipProps } from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import type { ScrvUsdRevenue } from '@/loan/entities/scrvusd-revenue.query'
import { formatDate } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { ChartTooltipDataRow, ChartTooltipSeriesGroup, ChartTooltipShell } from '@ui-kit/shared/ui/Chart'
import { formatNumber } from '@ui-kit/utils'

type Epoch = ScrvUsdRevenue['epochs'][number]

export const DistributionsChartTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (!active || !payload?.length) return null

  const { endDate, weeklyRevenue } = payload[0].payload as Epoch

  return (
    <ChartTooltipShell title={formatDate(endDate, 'long')}>
      <ChartTooltipSeriesGroup>
        <ChartTooltipDataRow label={t`Weekly Revenue`} value={formatNumber(weeklyRevenue, 'usd.notional')} />
      </ChartTooltipSeriesGroup>
    </ChartTooltipShell>
  )
}
