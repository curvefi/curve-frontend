import styled from 'styled-components'
import CampaignRewardsComp from 'ui/src/CampaignRewards/CampaignRewardsComp'
import type { RewardsPool } from 'ui/src/CampaignRewards/types'

interface Props {
  rewardItems: RewardsPool[]
  mobile?: boolean
}

const CampaignRewardsRow = ({ rewardItems, mobile = false }: Props) => (
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
