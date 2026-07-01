import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import Grid from '@mui/material/Grid'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { mapQuery } from '@ui-kit/types/util'
import { formatNumber, weiToEther } from '@ui-kit/utils'
import { useMetrics } from '../hooks/useMetrics'

const { Spacing } = SizesAndSpaces

const METRIC_GRID_SIZE = { mobile: 6, tablet: 3 } as const

export const Metrics = ({
  chainId,
  poolDataCacheOrApi,
  poolId,
  pricesApiPoolData,
}: {
  chainId: ChainId
  poolDataCacheOrApi: PoolDataCacheOrApi
  poolId: string
  pricesApiPoolData?: PricesApiPool
}) => {
  const { liquidityUtilization, gaugeTotalSupply, totalStakedPercent } = useMetrics({
    chainId,
    poolDataCacheOrApi,
    poolId,
    pricesApiPoolData,
  })

  return (
    <Grid container spacing={Spacing.md}>
      <Grid size={METRIC_GRID_SIZE}>
        <Metric
          size="medium"
          label={t`Liquidity utilization`}
          value={liquidityUtilization}
          valueOptions={{ unit: 'percentage', abbreviate: false }}
        />
      </Grid>

      <Grid size={METRIC_GRID_SIZE}>
        <Metric
          size="medium"
          label={t`LP Staked`}
          value={mapQuery(gaugeTotalSupply, supply => weiToEther(supply))}
          valueOptions={{ abbreviate: true }}
          notional={mapQuery(
            totalStakedPercent,
            x => t`${formatNumber(x, { unit: 'percentage', abbreviate: false })} of Pool`,
          )}
        />
      </Grid>
    </Grid>
  )
}
