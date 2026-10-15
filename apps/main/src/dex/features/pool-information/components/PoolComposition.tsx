import { usePoolContext } from '@/dex/features/pool-context'
import { usePoolComposition } from '@/dex/features/pool-information/hooks/usePoolComposition'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { PoolCompositionCard } from '@ui/features/pools/PoolCompositionCard'

export const PoolComposition = ({ pricesApiPoolData }: { pricesApiPoolData?: PricesApiPool }) => {
  const {
    chainId,
    poolAddress: { data: poolAddress },
    isWrapped,
    tokens: { data: tokens },
    tokenAddresses: { data: tokenAddresses },
  } = usePoolContext()
  return (
    <PoolCompositionCard
      {...usePoolComposition({ chainId, poolAddress, isWrapped, tokens, tokenAddresses, pricesApiPoolData })}
    />
  )
}
