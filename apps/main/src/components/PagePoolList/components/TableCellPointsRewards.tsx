import styled from 'styled-components'

import networks from '@/networks'
import RewardsCompSmall from '@/ui/PointsRewards/RewardsCompSmall'

interface Props {
  rChainId: ChainId
  poolAddress: string
  rewardsMapper: RewardsPoolMapper
  mobile?: boolean
}

const TableCellPointsRewards: React.FC<Props> = ({ rChainId, poolAddress, rewardsMapper, mobile = false }) => {
  return (
    <Container mobile={mobile}>
      {rewardsMapper[poolAddress].map((rewardItem: RewardsPool) => (
        <RewardsCompSmall
          platform={rewardItem.platform}
          description={rewardItem.description}
          multiplier={rewardItem.multiplier}
          imgSrc={`${networks[rChainId].rewards.imageBaseUrl}/${rewardItem.imageId}`}
        />
      ))}
    </Container>
  )
}

const Container = styled.div<{ mobile: boolean }>`
  display: flex;
  flex-wrap: wrap;
  max-width: 12rem;
  gap: var(--spacing-1);
  margin: ${({ mobile }) => (mobile ? '0' : '0 0 0 auto')};
  justify-content: ${({ mobile }) => (mobile ? 'start' : 'end')};
`

export default TableCellPointsRewards
