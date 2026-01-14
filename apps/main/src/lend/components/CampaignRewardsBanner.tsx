import { networks } from '@/lend/networks'
import { ChainId } from '@/lend/types/lend.types'
import type { Chain } from '@curvefi/prices-api'
import { CampaignBannerComp } from '@ui/CampaignRewards/CampaignBannerComp'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import type { Address } from '@ui-kit/utils'

interface CampaignRewardsBannerProps {
  chainId: ChainId
  borrowAddress: string
  supplyAddress: string
}

export const CampaignRewardsBanner = ({ chainId, borrowAddress, supplyAddress }: CampaignRewardsBannerProps) => {
  const blockchainId = networks[chainId].id as Chain
  const { data: supplyCampaigns } = useCampaignsByAddress({ blockchainId, address: supplyAddress as Address })
  const { data: borrowCampaigns } = useCampaignsByAddress({ blockchainId, address: borrowAddress as Address })

  return (
    supplyCampaigns.length + borrowCampaigns.length > 0 && (
      <CampaignBannerComp
        campaignRewardsPool={[...supplyCampaigns, ...borrowCampaigns]}
        message={
          supplyCampaigns.length && borrowCampaigns.length
            ? t`Supplying and borrowing in this pool earns points!`
            : supplyCampaigns
              ? t`Supplying in this pool earns points!`
              : t`Borrowing in this pool earns points!`
        }
      />
    )
  )
}
