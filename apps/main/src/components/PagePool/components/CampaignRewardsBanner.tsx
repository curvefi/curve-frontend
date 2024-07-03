import useCampaignRewardsMapper from '@/hooks/useCampaignRewardsMapper'

import CampaignBannerComp from 'ui/src/CampaignRewards/CampaignBannerComp'

const CampaignRewardsBanner: React.FC<{ poolAddress: string }> = ({ poolAddress }) => {
  const campaignRewardsPool = useCampaignRewardsMapper()[poolAddress]

  return campaignRewardsPool ? <CampaignBannerComp campaignRewardsPool={campaignRewardsPool} /> : null
}

export default CampaignRewardsBanner
