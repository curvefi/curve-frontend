import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import Grid from '@mui/material/Grid'
import { maybe, maybes } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber, weiToEther } from '@ui-kit/utils'
import { useMetrics } from '../hooks/useMetrics'

const { Spacing } = SizesAndSpaces

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
  const { tvl, volume, gaugeTotalSupply, totalStakedPercent } = useMetrics({
    chainId,
    poolDataCacheOrApi,
    poolId,
    pricesApiPoolData,
  })

  return (
    <Grid container columnSpacing={Spacing.md} rowSpacing={Spacing.md}>
      <Grid size={4}>
        <Metric
          size="medium"
          label={t`24h volume`}
          value={volume}
          valueOptions={{ unit: 'dollar', abbreviate: true }}
          notional={maybe(tvl, value => ({ value, unit: 'dollar', abbreviate: true }))}
        />
      </Grid>

      <Grid size={4}>
        <Metric
          size="medium"
          label={t`Liquidity utilization`}
          value={maybes([tvl, volume], ([tvl, volume]) => (tvl === 0 ? 0 : (volume / tvl) * 100))}
          valueOptions={{ unit: 'percentage', abbreviate: false }}
        />
      </Grid>

      <Grid size={4}>
        <Metric
          size="medium"
          label={t`LP Staked`}
          value={maybe(gaugeTotalSupply, supply => weiToEther(supply))}
          valueOptions={{ abbreviate: true }}
          notional={maybe(
            totalStakedPercent,
            x => t`${formatNumber(x, { unit: 'percentage', abbreviate: false })} of Pool`,
          )}
        />
      </Grid>
    </Grid>
  )
}
