import styled from 'styled-components'


import TableCellRewardsBase from '@/components/PagePoolList/components/TableCellRewardsBase'
import TableCellRewardsGauge from '@/components/PagePoolList/components/TableCellRewardsGauge'
import TableCellRewardsOthers from '@/components/PagePoolList/components/TableCellRewardsOthers'
import PoolRewardsCrv from '@/components/PoolRewardsCrv'
import useStore from '@/store/useStore'

interface Props {
  isHighlightBase: boolean
  isHighlightCrv: boolean
  isHighlightOther: boolean
  poolData: PoolDataCache | PoolData | undefined
  rewardsApy: RewardsApy | undefined
  searchText: string
}

const TCellRewards = ({
  isHighlightBase,
  isHighlightCrv,
  isHighlightOther,
  poolData,
  rewardsApy,
  searchText,
}: Props) => {
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
        <TableCellRewardsGauge address={poolData?.pool?.gauge.address} searchText={searchText} />
      </div>
    )
  }
}

const Wrapper = styled.div`
  line-height: 1.2;
`

export default TCellRewards
