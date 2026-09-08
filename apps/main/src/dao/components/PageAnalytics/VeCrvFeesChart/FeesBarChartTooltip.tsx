import type { VeCrvFee } from '@/dao/entities/vecrv-fees'
import { ChartTooltipDataRow, ChartTooltipSeriesGroup, ChartTooltipShell } from '@evm-ui/shared/ui/Chart'
import { formatDate } from '@primitives/date.utils'
import { formatNumber } from '@primitives/number.utils'
import { t } from '@ui/lib/i18n'

export const FeesBarChartTooltip = ({ datum, currentDate }: { datum: VeCrvFee; currentDate: Date }) => (
  <ChartTooltipShell
    title={
      <>
        {formatDate(datum.timestamp)}
        {new Date(datum.timestamp) > currentDate && <strong> {t`(in progress)`}</strong>}
      </>
    }
  >
    <ChartTooltipSeriesGroup>
      <ChartTooltipDataRow label={t`veCRV Fees`} value={formatNumber(datum.feesUsd, 'usd.notional')} />
    </ChartTooltipSeriesGroup>
  </ChartTooltipShell>
)
