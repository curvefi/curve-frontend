
import styled from 'styled-components'

import CampaignRewardsComp from 'ui/src/CampaignRewards/CampaignRewardsComp'
import type { RewardsPool } from 'ui/src/CampaignRewards/types'

interface Props {
  rewardItems: RewardsPool[]
  mobile?: boolean
}

const CampaignRewardsRow: React.FC<Props> = ({ rewardItems, mobile = false }) => {
  return (
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
}

const Container = styled.div<{ mobile: boolean }>`
  display: flex;
  flex-wrap: wrap;
  max-width: 12rem;
  gap: var(--spacing-1);
  margin-left: var(--spacing-1);
`

export default CampaignRewardsRow
