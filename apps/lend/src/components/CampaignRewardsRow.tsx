import type { RewardsPool } from 'ui/src/CampaignRewards/types'

import styled from 'styled-components'

import CampaignRewardsComp from 'ui/src/CampaignRewards/CampaignRewardsComp'

interface Props {
  rewardItems: RewardsPool[]
  mobile?: boolean
}

const CampaignRewardsRow: React.FC<Props> = ({ rewardItems, mobile = false }) => {
  const currentTime = new Date().getTime() / 1000

  const filteredRewardItems = rewardItems.filter((rewardItem) => {
    // allow campaigns with no set period
    if (rewardItem.campaignStart === '0' || rewardItem.campaignEnd === '0') {
      return true
    }

    // check if current time is within the campaign period
    const startTime = new Date(+rewardItem.campaignStart).getTime()
    const endTime = new Date(+rewardItem.campaignEnd).getTime()
    return currentTime >= startTime && currentTime <= endTime
  })

  return (
    <Container mobile={mobile}>
      {filteredRewardItems.map((rewardItem: RewardsPool, index: number) => (
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
