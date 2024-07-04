import { t } from '@lingui/macro'

import useCampaignRewardsMapper from '@/hooks/useCampaignRewardsMapper'

import CampaignBannerComp from 'ui/src/CampaignRewards/CampaignBannerComp'

const CampaignRewardsBanner: React.FC<{ poolAddress: string }> = ({ poolAddress }) => {
  const campaignRewardsPool = useCampaignRewardsMapper()[poolAddress]

  const isPoints = campaignRewardsPool && campaignRewardsPool.some((rewardItem) => rewardItem.tags.includes('points'))

  const bannerMessage = () => {
    if (isPoints) return t`Liquiditity providers in this pool also earn points!`
    return t`Liquiditity providers in this pool also earn additional tokens!`
  }

  return campaignRewardsPool ? (
    <CampaignBannerComp campaignRewardsPool={campaignRewardsPool} message={bannerMessage()} />
  ) : null
}

export default CampaignRewardsBanner
