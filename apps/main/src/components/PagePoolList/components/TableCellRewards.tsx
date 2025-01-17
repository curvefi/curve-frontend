import styled from 'styled-components'

import useStore from '@main/store/useStore'

import PoolRewardsCrv from '@main/components/PoolRewardsCrv'
import TableCellRewardsBase from '@main/components/PagePoolList/components/TableCellRewardsBase'
import TableCellRewardsOthers from '@main/components/PagePoolList/components/TableCellRewardsOthers'
import { RewardsApy, PoolData, PoolDataCache } from '@main/types/main.types'

interface Props {
  isHighlightBase: boolean
  isHighlightCrv: boolean
  isHighlightOther: boolean
  poolData: PoolDataCache | PoolData | undefined
  rewardsApy: RewardsApy | undefined
}

const TCellRewards = ({ isHighlightBase, isHighlightCrv, isHighlightOther, poolData, rewardsApy }: Props) => {
  const isMdUp = useStore((state) => state.isMdUp)
  const isXSmDown = useStore((state) => state.isXSmDown)
  if (typeof rewardsApy === 'undefined') {
    return <>-</>
  } else {
    return (
      <div>
        {!isXSmDown && !isMdUp && (
          <TableCellRewardsBase base={rewardsApy?.base} isHighlight={isHighlightBase} poolData={poolData} />
        )}
        <Wrapper>
          <PoolRewardsCrv isHighlight={isHighlightCrv} poolData={poolData} rewardsApy={rewardsApy} />
          <TableCellRewardsOthers isHighlight={isHighlightOther} rewardsApy={rewardsApy} />
        </Wrapper>
      </div>
    )
  }
}

const Wrapper = styled.div`
  line-height: 1.2;
`

export default TCellRewards
