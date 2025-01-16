import type { RewardsPool } from '@/ui/CampaignRewards/types'

import styled from 'styled-components'

import CampaignRewardsComp from '@/ui/CampaignRewards/CampaignRewardsComp'

interface Props {
  rewardItems: RewardsPool[]
  mobile?: boolean
}

const CampaignRewardsRow: React.FC<Props> = ({ rewardItems, mobile = false }) => (
  <Container mobile={mobile}>
    {rewardItems.map((rewardItem: RewardsPool, index: number) => (
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

export default CampaignRewardsRow
