import { t } from '@lingui/macro'

import useCampaignRewardsMapper from '@/hooks/useCampaignRewardsMapper'

import CampaignBannerComp from 'ui/src/CampaignRewards/CampaignBannerComp'

const CampaignRewardsBanner: React.FC<{ poolAddress: string }> = ({ poolAddress }) => {
  const campaignRewardsPool = useCampaignRewardsMapper()[poolAddress]

  if (!campaignRewardsPool) return null

  return (
    <CampaignBannerComp campaignRewardsPool={campaignRewardsPool} message={t`Borrowing in this pool earns points!`} />
  )
}

export default CampaignRewardsBanner
