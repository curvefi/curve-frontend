import { PoolRewardsCrv } from '@/dex/components/PoolRewardsCrv'
import { RewardsApy, PoolData, PoolDataCache } from '@/dex/types/main.types'

type Prop = {
  isHighlight: boolean
  poolData: PoolDataCache | PoolData | undefined
  rewardsApy: RewardsApy | undefined
}

export const TableCellRewardsCrv = ({ isHighlight, poolData, rewardsApy }: Prop) => (
  <PoolRewardsCrv poolData={poolData} rewardsApy={rewardsApy} isHighlight={isHighlight} />
)
