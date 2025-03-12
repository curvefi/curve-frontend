import styled from 'styled-components'
import TableCellRewardsBase from '@/dex/components/PagePoolList/components/TableCellRewardsBase'
import TableCellRewardsOthers from '@/dex/components/PagePoolList/components/TableCellRewardsOthers'
import PoolRewardsCrv from '@/dex/components/PoolRewardsCrv'
import useStore from '@/dex/store/useStore'
import { RewardsApy, PoolData, PoolDataCache } from '@/dex/types/main.types'

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
