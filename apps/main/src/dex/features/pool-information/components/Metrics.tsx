import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { t } from '@evm-ui/lib/i18n'
import { Metric } from '@evm-ui/shared/ui/Metric'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { mapQuery, type QueryProp } from '@evm-ui/types/util'
import { formatNumber, fromWei } from '@evm-ui/utils'
import Grid from '@mui/material/Grid'
import { DEFAULT_DECIMALS } from '@primitives/objects.utils'
import { useMetrics } from '../hooks/useMetrics'

const { Spacing } = SizesAndSpaces

const METRIC_GRID_SIZE = { mobile: 6, tablet: 3 } as const
const METRIC_CATEGORY = 'dex.poolInformation'

export const Metrics = ({
  chainId,
  poolQuery,
  pricesApiPoolData,
}: {
  chainId: ChainId
  poolQuery: QueryProp<PoolDataCacheOrApi | undefined>
  pricesApiPoolData?: PricesApiPool
}) => {
  const { liquidityUtilization, gaugeTotalSupply, totalStakedPercent } = useMetrics({
    chainId,
    poolQuery,
    pricesApiPoolData,
  })

  return (
    <Grid container spacing={Spacing.md}>
      <Grid size={METRIC_GRID_SIZE}>
        <Metric
          category={METRIC_CATEGORY}
          label={t`Liquidity utilization`}
          value={liquidityUtilization}
          valueOptions={{ unit: 'percentage', abbreviate: false }}
        />
      </Grid>

      <Grid size={METRIC_GRID_SIZE}>
        <Metric
          category={METRIC_CATEGORY}
          label={t`LP Staked`}
          value={mapQuery(gaugeTotalSupply, supply => fromWei(supply, DEFAULT_DECIMALS))}
          valueOptions={{ abbreviate: true }}
          notional={mapQuery(totalStakedPercent, x => t`${formatNumber(x, 'percent.rate')} of Pool`)}
        />
      </Grid>
    </Grid>
  )
}
