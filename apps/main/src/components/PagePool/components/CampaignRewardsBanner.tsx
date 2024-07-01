import useStore from '@/store/useStore'

import CampaignBannerComp from 'ui/src/CampaignRewards/CampaignBannerComp'

const CampaignRewardsBanner: React.FC<{ poolAddress: string }> = ({ poolAddress }) => {
  const campaignRewardsPool = useStore((state) => state.campaigns.campaignRewardsMapper[poolAddress])

  return campaignRewardsPool ? <CampaignBannerComp campaignRewardsPool={campaignRewardsPool} /> : null
}

export default CampaignRewardsBanner
