import { PoolLiquidityDensityChart } from '@/dex/features/liquidity-density/PoolLiquidityDensityChart'
import { usePoolContext } from '@/dex/features/pool-context'
import { usePoolComposition } from '@/dex/features/pool-information/hooks/usePoolComposition'
import { isLiteChain } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { useLiquidityDensityChart } from '@evm-ui/hooks/useFeatureFlags'
import { PoolCompositionCard } from '@ui/features/pools/PoolCompositionCard'

export const PoolComposition = () => {
  const { chainId } = usePoolContext()
  return (
    <PoolCompositionCard {...usePoolComposition()}>
      {useLiquidityDensityChart() && !isLiteChain(chainId) && <PoolLiquidityDensityChart />}
    </PoolCompositionCard>
  )
}
