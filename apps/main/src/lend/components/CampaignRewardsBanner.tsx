import CampaignBannerComp from 'ui/src/CampaignRewards/CampaignBannerComp'
import useCampaignRewardsMapper from '@/lend/hooks/useCampaignRewardsMapper'
import { t } from '@ui-kit/lib/i18n'

interface CampaignRewardsBannerProps {
  borrowAddress: string
  supplyAddress: string
}

const CampaignRewardsBanner = ({ borrowAddress, supplyAddress }: CampaignRewardsBannerProps) => {
  const supplyCampaignRewardsPool = useCampaignRewardsMapper()[supplyAddress]
  const borrowCampaignRewardsPool = useCampaignRewardsMapper()[borrowAddress]

  if (!supplyCampaignRewardsPool && !borrowCampaignRewardsPool) return null

  const campaignRewardsPools = () => {
    if (supplyCampaignRewardsPool && borrowCampaignRewardsPool) {
      return [...supplyCampaignRewardsPool, ...borrowCampaignRewardsPool]
    }
    if (supplyCampaignRewardsPool) return supplyCampaignRewardsPool
    if (borrowCampaignRewardsPool) return borrowCampaignRewardsPool
    return []
  }

  const message =
    supplyCampaignRewardsPool && borrowCampaignRewardsPool
      ? t`Supplying and borrowing in this pool earns points!`
      : supplyCampaignRewardsPool
        ? t`Supplying in this pool earns points!`
        : t`Borrowing in this pool earns points!`

  return <CampaignBannerComp campaignRewardsPool={campaignRewardsPools()} message={message} />
}

export default CampaignRewardsBanner
