import PoolRewardsCrv from '@/components/PoolRewardsCrv'

type Prop = {
  isHighlight: boolean
  poolData: PoolDataCache | PoolData | undefined
  rewardsApy: RewardsApy | undefined
}

const TableCellRewardsCrv = ({ isHighlight, poolData, rewardsApy }: Prop) => (
  <PoolRewardsCrv poolData={poolData} rewardsApy={rewardsApy} isHighlight={isHighlight} />
)

export default TableCellRewardsCrv
