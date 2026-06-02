import { PoolRewardsCrv } from '@/dex/components/PoolRewardsCrv'
import { RewardsApy, PoolData, PoolDataCache } from '@/dex/types/main.types'
import { TableCellRewardsOthers } from './TableCellRewardsOthers'

type PoolRewardsTooltipContentProps = {
  isHighlightBase: boolean
  isHighlightCrv: boolean
  isHighlightOther: boolean
  poolData: PoolDataCache | PoolData | undefined
  rewardsApy: RewardsApy | undefined
}

export const PoolRewardsTooltipContent = ({
  isHighlightCrv,
  isHighlightOther,
  poolData,
  rewardsApy,
}: PoolRewardsTooltipContentProps) =>
  rewardsApy == null ? (
    '-'
  ) : (
    <>
      <PoolRewardsCrv isHighlight={isHighlightCrv} poolData={poolData} rewardsApy={rewardsApy} />
      <TableCellRewardsOthers isHighlight={isHighlightOther} rewardsApy={rewardsApy} />
    </>
  )
