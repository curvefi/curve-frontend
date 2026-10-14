import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { Metric } from '@ui/components/Metric'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

const METRIC_CATEGORY = 'dex.poolInformation'

export type PoolInformationMetricsProps = {
  liquidityUtilization: QueryProp<Decimal>
  gaugeTotalSupply: QueryProp<Decimal>
  totalStakedPercent: QueryProp<Decimal>
}

export const Metrics = ({
  liquidityUtilization,
  gaugeTotalSupply,
  totalStakedPercent,
}: PoolInformationMetricsProps) => (
  <MetricsGrid>
    <Metric
      category={METRIC_CATEGORY}
      label={t`Liquidity utilization`}
      value={liquidityUtilization}
      valueOptions={{ unit: 'percentage', abbreviate: false }}
    />

    <Metric
      category={METRIC_CATEGORY}
      label={t`LP Staked`}
      value={gaugeTotalSupply}
      valueOptions={{ abbreviate: true }}
      notional={mapQuery(totalStakedPercent, x => t`${formatNumber(x, 'percent.rate')} of Pool`)}
    />
  </MetricsGrid>
)
