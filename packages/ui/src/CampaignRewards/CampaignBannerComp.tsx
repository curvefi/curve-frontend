import type { CampaignRewardsBannerCompProps } from './types'

import styled from 'styled-components'

import { ExternalLink } from 'ui/src/Link'
import { RCPointsIcon } from 'ui/src/images'
import RewardsCompSmall from './CampaignRewardsComp'

const RewardsBannerComp: React.FC<CampaignRewardsBannerCompProps> = ({ campaignRewardsPool }) => {
  const isPoints = campaignRewardsPool.some((rewardItem) => rewardItem.tags.includes('points'))

  const bannerMessage = () => {
    if (isPoints) return <RewardsMessage>Liquiditity providers in this pool also earn points!</RewardsMessage>
    return (
      <RewardsMessage>
        Liquiditity providers in this pool also earn additional tokens!
        <ExternalLink $noStyles href={campaignRewardsPool[0].dashboardLink}>
          Learn more
        </ExternalLink>
      </RewardsMessage>
    )
  }

  return (
    <Wrapper>
      <StyledPointsIcon />
      {bannerMessage()}
      {campaignRewardsPool.map((rewardItem, index) => (
        <RewardsCompSmall key={`${rewardItem.poolAddress}-${index}`} rewardsPool={rewardItem} highContrast banner />
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
  display: flex;
  gap: var(--spacing-2);
`

const StyledPointsIcon = styled(RCPointsIcon)`
  width: 24px;
  height: 24px;
  color: var(--white);
`

export default RewardsBannerComp
