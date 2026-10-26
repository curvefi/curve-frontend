import type { UserGaugeVoteWeight } from '@/dao/types/dao.types'
import { formatNumber } from '@primitives/number.utils'
import {
  ChartTooltipDataRow,
  ChartTooltipSeriesGroup,
  ChartTooltipShell,
} from '@ui/features/charts/ChartTooltipComponents'
import { t } from '@ui/lib/i18n'
import { formatToken } from '@ui/lib/tokens'

export const GaugeVotingBarChartCustomTooltip = ({ datum }: { datum: UserGaugeVoteWeight }) => (
  <ChartTooltipShell title={datum.title}>
    <ChartTooltipSeriesGroup>
      <ChartTooltipDataRow label={t`User Weight`} value={formatNumber(datum.userPower, 'percent.value')} />
      <ChartTooltipDataRow label={t`User veCRV`} value={formatToken(datum.userVeCrv, 'veCRV')} />
    </ChartTooltipSeriesGroup>
  </ChartTooltipShell>
)
