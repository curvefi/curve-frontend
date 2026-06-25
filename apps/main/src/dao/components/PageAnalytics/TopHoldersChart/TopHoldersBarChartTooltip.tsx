import type { VeCrvHolder } from '@/dao/entities/vecrv-holders'
import { formatHolderName } from '@/dao/utils'
import { maybe } from '@primitives/objects.utils'
import { formatDate } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { ChartTooltipDataRow, ChartTooltipSeriesGroup, ChartTooltipShell } from '@ui-kit/shared/ui/Chart'
import { formatNumber } from '@ui-kit/utils'

export const TopHoldersBarChartTooltip = ({ datum }: { datum: VeCrvHolder }) => (
  <ChartTooltipShell title={formatHolderName(datum.user)}>
    <ChartTooltipSeriesGroup>
      <ChartTooltipDataRow label={t`Relative Weight`} value={formatNumber(datum.weightRatio, 'percent.value')} />
      <ChartTooltipDataRow label={t`veCRV`} value={formatNumber(datum.weight, 'token.amount')} />
      <ChartTooltipDataRow label={t`Locked CRV`} value={formatNumber(datum.locked, 'token.amount')} />
      <ChartTooltipDataRow label={t`Unlock Date`} value={maybe(datum.unlockTime, formatDate) ?? t`N/A`} />
    </ChartTooltipSeriesGroup>
  </ChartTooltipShell>
)
