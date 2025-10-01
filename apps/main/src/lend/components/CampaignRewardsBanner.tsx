import CampaignBannerComp from 'ui/src/CampaignRewards/CampaignBannerComp'
import networks from '@/lend/networks'
import { ChainId } from '@/lend/types/lend.types'
import type { Chain } from '@curvefi/prices-api'
import { useCampaigns } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'

interface CampaignRewardsBannerProps {
  chainId: ChainId
  borrowAddress: string
  supplyAddress: string
}

const CampaignRewardsBanner = ({ chainId, borrowAddress, supplyAddress }: CampaignRewardsBannerProps) => {
  const blockchainId = networks[chainId].id as Chain
  const { data: campaigns } = useCampaigns({ blockchainId })
  const supplyCampaignRewardsPool = campaigns?.[supplyAddress] ?? []
  const borrowCampaignRewardsPool = campaigns?.[borrowAddress] ?? []
  return (
    supplyCampaignRewardsPool.length + borrowCampaignRewardsPool.length > 0 && (
      <CampaignBannerComp
        campaignRewardsPool={[...supplyCampaignRewardsPool, ...borrowCampaignRewardsPool]}
        message={
          supplyCampaignRewardsPool.length && borrowCampaignRewardsPool.length
            ? t`Supplying and borrowing in this pool earns points!`
            : supplyCampaignRewardsPool
              ? t`Supplying in this pool earns points!`
              : t`Borrowing in this pool earns points!`
        }
      />
    )
  )
}

export default CampaignRewardsBanner
