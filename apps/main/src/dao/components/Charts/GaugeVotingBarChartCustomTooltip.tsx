import type { UserGaugeVoteWeight } from '@/dao/types/dao.types'
import { ChartTooltipDataRow, ChartTooltipSeriesGroup, ChartTooltipShell } from '@evm-ui/shared/ui/Chart'
import { formatNumber, formatToken } from '@evm-ui/utils'
import { t } from '@ui/lib/i18n'

export const GaugeVotingBarChartCustomTooltip = ({ datum }: { datum: UserGaugeVoteWeight }) => (
  <ChartTooltipShell title={datum.title}>
    <ChartTooltipSeriesGroup>
      <ChartTooltipDataRow label={t`User Weight`} value={formatNumber(datum.userPower, 'percent.value')} />
      <ChartTooltipDataRow label={t`User veCRV`} value={formatToken(datum.userVeCrv, 'veCRV')} />
    </ChartTooltipSeriesGroup>
  </ChartTooltipShell>
)
