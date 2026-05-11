import { PoolRewardsCrv } from '@/dex/components/PoolRewardsCrv'
import { RewardsApy, PoolData, PoolDataCache } from '@/dex/types/main.types'
import { TableCellRewardsOthers } from './TableCellRewardsOthers'

interface Props {
  isHighlightBase: boolean
  isHighlightCrv: boolean
  isHighlightOther: boolean
  poolData: PoolDataCache | PoolData | undefined
  rewardsApy: RewardsApy | undefined
}

export const PoolRewardsTooltipContent = ({ isHighlightCrv, isHighlightOther, poolData, rewardsApy }: Props) => {
  if (typeof rewardsApy === 'undefined') {
    return <>-</>
  } else {
    return (
      <>
        <PoolRewardsCrv isHighlight={isHighlightCrv} poolData={poolData} rewardsApy={rewardsApy} />
        <TableCellRewardsOthers isHighlight={isHighlightOther} rewardsApy={rewardsApy} />
      </>
    )
  }
}
