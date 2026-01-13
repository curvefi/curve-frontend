import { styled } from 'styled-components'
import type { CampaignPoolRewards } from '@ui-kit/entities/campaigns'
import { RCPointsIcon } from 'ui/src/images'
import { ExternalLink } from 'ui/src/Link'
import { RewardsCompSmall } from './CampaignRewardsComp'

type CampaignRewardsBannerCompProps = {
  campaignRewardsPool: CampaignPoolRewards[]
  message: string
}

export const CampaignBannerComp = ({ campaignRewardsPool, message }: CampaignRewardsBannerCompProps) => (
  <Wrapper>
    <StyledPointsIcon />
    <RewardsMessage>
      {message}
      <ExternalLink $noStyles href={campaignRewardsPool[0].dashboardLink}>
        Learn more
      </ExternalLink>
    </RewardsMessage>
    <RewardsIconsWrapper>
      {campaignRewardsPool.map((rewardItem, index) => (
        <RewardsCompSmall key={`${rewardItem.address}-${index}`} rewardsPool={rewardItem} highContrast banner />
      ))}
    </RewardsIconsWrapper>
  </Wrapper>
)

const Wrapper = styled.div`
  background-color: var(--primary-200);
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
  flex-wrap: wrap;
`

const StyledPointsIcon = styled(RCPointsIcon)`
  min-width: 24px;
  min-height: 24px;
  max-width: 24px;
  min-width: 24px;
  color: var(--white);
`

const RewardsIconsWrapper = styled.div`
  display: flex;
  gap: var(--spacing-1);
  flex-wrap: wrap;
  justify-content: flex-end;
  flex-shrink: 1;
`
