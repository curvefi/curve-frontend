import { t } from '@lingui/macro'

import useCampaignRewardsMapper from '@/hooks/useCampaignRewardsMapper'

import CampaignBannerComp from 'ui/src/CampaignRewards/CampaignBannerComp'

const CampaignRewardsBanner: React.FC<{ poolAddress: string }> = ({ poolAddress }) => {
  const campaignRewardsPool = useCampaignRewardsMapper()[poolAddress]

  if (!campaignRewardsPool) return null

  const currentTime = new Date().getTime() / 1000

  const filteredRewardItems = campaignRewardsPool.filter((rewardItem) => {
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
    <CampaignBannerComp campaignRewardsPool={filteredRewardItems} message={t`Borrowing in this pool earns points!`} />
  )
}

export default CampaignRewardsBanner
