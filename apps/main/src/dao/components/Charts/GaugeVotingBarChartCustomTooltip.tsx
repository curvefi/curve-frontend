import type { UserGaugeVoteWeight } from '@/dao/types/dao.types'
import { t } from '@ui-kit/lib/i18n'
import { ChartTooltipDataRow, ChartTooltipSeriesGroup, ChartTooltipShell } from '@ui-kit/shared/ui/Chart'
import { formatNumber } from '@ui-kit/utils'

export const GaugeVotingBarChartCustomTooltip = ({ datum }: { datum: UserGaugeVoteWeight }) => (
  <ChartTooltipShell title={datum.title}>
    <ChartTooltipSeriesGroup>
      <ChartTooltipDataRow label={t`User Weight`} value={formatNumber(datum.userPower, 'percent.value')} />
      <ChartTooltipDataRow label={t`User veCRV`} value={`${formatNumber(datum.userVeCrv, 'token.compact')} veCRV`} />
    </ChartTooltipSeriesGroup>
  </ChartTooltipShell>
)
