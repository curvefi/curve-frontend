import { usePoolTvl } from '@/dex/queries/pool-tvl.query'
import { usePoolVolume } from '@/dex/queries/pool-volume.query'
import type { ChainId } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import Stack from '@mui/material/Stack'
import { maybe } from '@primitives/objects.utils'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

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
        alignment={alignment}
        label={t`TVL`}
        value={maybe(tvl.data ?? pricesApiPoolData?.tvlUsd, x => +x)}
        valueOptions={{ unit: 'dollar' }}
        loading={tvl.isLoading}
        error={tvl.error}
      />

      <Metric
        alignment={alignment}
        label={t`24h volume`}
        value={maybe(volume.data ?? pricesApiPoolData?.tradingVolume24h, x => +x)}
        valueOptions={{ unit: 'dollar' }}
        loading={volume.isLoading}
        error={volume.error}
      />
    </Stack>
  )
}
