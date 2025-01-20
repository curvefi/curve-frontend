import PoolRewardsCrv from '@main/components/PoolRewardsCrv'
import { RewardsApy, PoolData, PoolDataCache } from '@main/types/main.types'

type Prop = {
  isHighlight: boolean
  poolData: PoolDataCache | PoolData | undefined
  rewardsApy: RewardsApy | undefined
}

const TableCellRewardsCrv = ({ isHighlight, poolData, rewardsApy }: Prop) => (
  <PoolRewardsCrv poolData={poolData} rewardsApy={rewardsApy} isHighlight={isHighlight} />
)

export default TableCellRewardsCrv
