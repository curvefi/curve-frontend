import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { Metric } from '@evm-ui/shared/ui/Metric'
import { fromWei } from '@evm-ui/utils'
import { formatNumber } from '@primitives/number.utils'
import { DEFAULT_DECIMALS } from '@primitives/objects.utils'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { mapQuery } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { usePoolContext } from '../../pool-context'
import { useMetrics } from '../hooks/useMetrics'

const METRIC_CATEGORY = 'dex.poolInformation'

export const Metrics = ({ pricesApiPoolData }: { pricesApiPoolData?: PricesApiPool }) => {
  const { chainId, poolId, poolData } = usePoolContext()
  const { liquidityUtilization, gaugeTotalSupply, totalStakedPercent } = useMetrics({
    chainId,
    poolData,
    poolId,
    pricesApiPoolData,
  })

  return (
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
        value={mapQuery(gaugeTotalSupply, supply => fromWei(supply, DEFAULT_DECIMALS))}
        valueOptions={{ abbreviate: true }}
        notional={mapQuery(totalStakedPercent, x => t`${formatNumber(x, 'percent.rate')} of Pool`)}
      />
    </MetricsGrid>
  )
}
