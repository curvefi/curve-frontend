import { usePoolContext } from '@/dex/features/pool-context'
import { usePoolComposition } from '@/dex/features/pool-information/hooks/usePoolComposition'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { PoolCompositionCard } from '@ui/features/pools/PoolCompositionCard'

export const PoolComposition = ({ pricesApiPoolData }: { pricesApiPoolData?: PricesApiPool }) => {
  const { chainId, poolId, poolData } = usePoolContext()
  const { isLoading, error, rows, totalUsd } = usePoolComposition({ chainId, poolData, poolId, pricesApiPoolData })
  return <PoolCompositionCard rows={rows} totalUsd={totalUsd} isLoading={isLoading} error={error} />
}
