import { PoolLiquidityDensityChart } from '@/dex/features/liquidity-density/PoolLiquidityDensityChart'
import { usePoolContext } from '@/dex/features/pool-context'
import { usePoolComposition } from '@/dex/features/pool-information/hooks/usePoolComposition'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { useLiquidityDensityChart } from '@evm-ui/hooks/useFeatureFlags'
import { PoolCompositionCard } from '@ui/features/pools/PoolCompositionCard'
import type { QueryProp } from '@ui/features/queries/util'

export const PoolComposition = ({ pricesApiPoolData }: { pricesApiPoolData: QueryProp<PricesApiPool> }) => {
  const { chainId, poolAddress, isWrapped, tokens, tokenAddresses } = usePoolContext()
  return (
    <PoolCompositionCard
      {...usePoolComposition({ chainId, poolAddress, isWrapped, tokens, tokenAddresses, pricesApiPoolData })}
    >
      {useLiquidityDensityChart() && !isLiteChain(chainId) && <PoolLiquidityDensityChart />}
    </PoolCompositionCard>
  )
}
