import { TooltipProps } from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'
import { ChartTooltipShell, ChartTooltipSeriesGroup } from '@/llamalend/widgets/tooltips/chart/ChartTooltipComponents'
import type { ScrvUsdRevenue } from '@/loan/entities/scrvusd-revenue'
import { Stack, Typography } from '@mui/material'
import { formatDate } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { formatUsd } from '@ui-kit/utils'

type Epoch = ScrvUsdRevenue['epochs'][number]

export const DistributionsChartTooltip = ({ active, payload }: TooltipProps<ValueType, NameType>) => {
  if (!active || !payload || !payload.length) return null

  const { endDate, weeklyRevenue } = payload[0].payload as Epoch

  return (
    <ChartTooltipShell title={formatDate(endDate, 'long')}>
      <ChartTooltipSeriesGroup>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="bodySRegular">{t`Weekly Revenue`}</Typography>
          <Typography variant="bodySBold">{formatUsd(weeklyRevenue)}</Typography>
        </Stack>
      </ChartTooltipSeriesGroup>
    </ChartTooltipShell>
  )
}
