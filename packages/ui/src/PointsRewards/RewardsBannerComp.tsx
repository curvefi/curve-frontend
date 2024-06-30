import type { RewardsBannerCompProps } from './types'

import styled from 'styled-components'

import { RCPointsIcon } from 'ui/src/images'
import RewardsCompSmall from './RewardsCompSmall'

const RewardsBannerComp: React.FC<RewardsBannerCompProps> = ({ rewardsPool }) => {
  return (
    <Wrapper>
      <StyledPointsIcon />
      <RewardsMessage>Liquiditity providers in this pool also earn points!</RewardsMessage>
      {rewardsPool.map((rewardItem, index) => (
        <RewardsCompSmall key={`${rewardItem.poolAddress}-${index}`} rewardsPool={rewardItem} highContrast />
      ))}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  background-color: var(--primary-400);
  padding: var(--spacing-3);
  display: flex;
  align-items: center;
`

const RewardsMessage = styled.p`
  color: var(--white);
  font-size: var(--font-size-2);
  margin: auto auto auto var(--spacing-2);
  font-weight: var(--semi-bold);
  padding-right: var(--spacing-2);
`

const StyledPointsIcon = styled(RCPointsIcon)`
  width: 24px;
  height: 24px;
  color: var(--white);
`

export default RewardsBannerComp
