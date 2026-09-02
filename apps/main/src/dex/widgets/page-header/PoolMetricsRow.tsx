import { usePoolTvl } from '@/dex/queries/pool-tvl.query'
import { usePoolVolume } from '@/dex/queries/pool-volume.query'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import { combineQueries } from '@evm-ui/lib'
import { t } from '@evm-ui/lib/i18n'
import { Metric } from '@evm-ui/shared/ui/Metric'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { fallbackQ, mapQuery, type QueryProp } from '@evm-ui/types/util'
import { amount } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'

const { Spacing } = SizesAndSpaces

const METRIC_CATEGORY = 'dex.poolHeader'

export const PoolMetricsRow = ({
  chainId,
  poolQuery,
  pricesApiPoolData,
}: {
  chainId: ChainId
  poolQuery: QueryProp<PoolDataCacheOrApi | undefined>
  pricesApiPoolData?: PricesApiPool
}) => {
  const poolId = poolQuery.data?.pool.id
  const volume = usePoolVolume({ chainId, poolId })
  const tvl = usePoolTvl({ chainId, poolId })
  const alignment = useIsMobile() ? 'start' : 'end'
  const poolVolume = combineQueries([poolQuery, volume], (_pool, data) => amount(data))
  const poolTvl = combineQueries([poolQuery, tvl], (_pool, data) => amount(data))
  const pricesApiVolume = mapQuery(poolQuery, () => amount(pricesApiPoolData?.tradingVolume24h))
  const pricesApiTvl = mapQuery(poolQuery, () => amount(pricesApiPoolData?.tvlUsd))

  return (
    <Stack direction="row" sx={{ gap: Spacing.xxl, alignItems: 'center', flexWrap: 'wrap' }}>
      <Metric
        category={METRIC_CATEGORY}
        alignment={alignment}
        label={t`TVL`}
        value={fallbackQ(poolTvl, pricesApiTvl)}
        valueOptions={{ unit: 'dollar' }}
      />

      <Metric
        category={METRIC_CATEGORY}
        alignment={alignment}
        label={t`24h volume`}
        value={fallbackQ(poolVolume, pricesApiVolume)}
        valueOptions={{ unit: 'dollar' }}
      />
    </Stack>
  )
}
