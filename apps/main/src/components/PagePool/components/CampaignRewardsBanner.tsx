import { t } from '@lingui/macro'

import useCampaignRewardsMapper from '@/hooks/useCampaignRewardsMapper'

import CampaignBannerComp from 'ui/src/CampaignRewards/CampaignBannerComp'

const CampaignRewardsBanner: React.FC<{ poolAddress: string }> = ({ poolAddress }) => {
  const campaignRewardsPool = useCampaignRewardsMapper()[poolAddress]

  if (!campaignRewardsPool) return null

  const isPoints = campaignRewardsPool && campaignRewardsPool.some((rewardItem) => rewardItem.tags.includes('points'))

  const bannerMessage = () => {
    if (isPoints) return t`Liquidity providers in this pool also earn points!`
    return t`Liquidity providers in this pool also earn additional tokens!`
  }

  return <CampaignBannerComp campaignRewardsPool={campaignRewardsPool} message={bannerMessage()} />
}

export default CampaignRewardsBanner
