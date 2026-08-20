import type { VeCrvFee } from '@/dao/entities/vecrv-fees'
import { formatDate } from '@legacy-ui/utils'
import { t } from '@evm-ui/lib/i18n'
import { ChartTooltipDataRow, ChartTooltipSeriesGroup, ChartTooltipShell } from '@evm-ui/shared/ui/Chart'
import { formatNumber } from '@evm-ui/utils'

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
