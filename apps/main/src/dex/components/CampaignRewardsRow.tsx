import { styled } from 'styled-components'
import { RewardsCompSmall as CampaignRewardsComp } from '@ui/CampaignRewards/CampaignRewardsComp'
import type { CampaignPoolRewards } from '@ui-kit/entities/campaigns'

interface Props {
  rewardItems: CampaignPoolRewards[]
  mobile?: boolean
}

export const CampaignRewardsRow = ({ rewardItems, mobile = false }: Props) => (
  <Container mobile={mobile}>
    {rewardItems.map((rewardItem, index) => (
      <CampaignRewardsComp
        key={`${rewardItem.platform}-${rewardItem.description}-${index}`}
        rewardsPool={rewardItem}
        mobile={mobile}
      />
    ))}
  </Container>
)

const Container = styled.div<{ mobile: boolean }>`
  display: flex;
  flex-wrap: wrap;
  max-width: 12rem;
  gap: var(--spacing-1);
  @media (min-width: 37.5rem) {
    margin: ${({ mobile }) => (mobile ? '0' : '0 0 0 auto')};
    justify-content: ${({ mobile }) => (mobile ? 'start' : 'end')};
  }
`
