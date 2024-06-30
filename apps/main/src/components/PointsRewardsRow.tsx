import type { RewardsPool } from '@/ui/PointsRewards/types'

import styled from 'styled-components'

import RewardsCompSmall from '@/ui/PointsRewards/RewardsCompSmall'

interface Props {
  rewardItems: RewardsPool[]
  mobile?: boolean
}

const PointsRewardsRow: React.FC<Props> = ({ rewardItems, mobile = false }) => {
  return (
    <Container mobile={mobile}>
      {rewardItems.map((rewardItem: RewardsPool, index: number) => (
        <RewardsCompSmall key={`${rewardItem.platform}-${rewardItem.description}-${index}`} rewardsPool={rewardItem} />
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

export default PointsRewardsRow
