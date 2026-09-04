import { usePoolTvl } from '@/dex/queries/pool-tvl.query'
import { usePoolVolume } from '@/dex/queries/pool-volume.query'
import type { ChainId } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import { t } from '@evm-ui/lib/i18n'
import { Metric } from '@evm-ui/shared/ui/Metric'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { amount } from '@evm-ui/utils'
import Stack from '@mui/material/Stack'
import { constQ, fallbackQ, mapQuery } from '@ui/features/queries/util'

const { Spacing } = SizesAndSpaces

const METRIC_CATEGORY = 'dex.poolHeader'

export const PoolMetricsRow = ({
  chainId,
  poolId,
  pricesApiPoolData,
}: {
  chainId: ChainId
  poolId: string
  pricesApiPoolData?: PricesApiPool
}) => {
  const volume = usePoolVolume({ chainId, poolId })
  const tvl = usePoolTvl({ chainId, poolId })
  const alignment = useIsMobile() ? 'start' : 'end'
  return (
    <Stack direction="row" sx={{ gap: Spacing.xxl, alignItems: 'center', flexWrap: 'wrap' }}>
      <Metric
        category={METRIC_CATEGORY}
        alignment={alignment}
        label={t`TVL`}
        value={fallbackQ(
          mapQuery(tvl, data => amount(data)),
          constQ(amount(pricesApiPoolData?.tvlUsd)),
        )}
        valueOptions={{ unit: 'dollar' }}
      />

      <Metric
        category={METRIC_CATEGORY}
        alignment={alignment}
        label={t`24h volume`}
        value={fallbackQ(
          mapQuery(volume, data => amount(data)),
          constQ(amount(pricesApiPoolData?.tradingVolume24h)),
        )}
        valueOptions={{ unit: 'dollar' }}
      />
    </Stack>
  )
}
