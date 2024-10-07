import { t } from '@lingui/macro'

import CampaignBannerComp from 'ui/src/CampaignRewards/CampaignBannerComp'
import useCampaignRewardsMapper from '@/hooks/useCampaignRewardsMapper'


interface CampaignRewardsBannerProps {
  address: string
}

const CampaignRewardsBanner: React.FC<CampaignRewardsBannerProps> = ({ address }) => {
  const campaignRewardsPool = useCampaignRewardsMapper()[address]

  if (!campaignRewardsPool) return null

  const isPoints = campaignRewardsPool && campaignRewardsPool.some((rewardItem) => rewardItem.tags.includes('points'))

  const bannerMessage = () => {
    if (isPoints) return t`Liquidity providers in this pool also earn points!`
    return t`Liquidity providers in this pool also earn additional tokens!`
  }

  return <CampaignBannerComp campaignRewardsPool={campaignRewardsPool} message={bannerMessage()} />
}

export default CampaignRewardsBanner
