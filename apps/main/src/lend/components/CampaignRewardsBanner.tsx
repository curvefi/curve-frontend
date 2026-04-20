import { networks } from '@/lend/networks'
import { ChainId } from '@/lend/types/lend.types'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { CampaignBannerComp } from '@ui/CampaignRewards/CampaignBannerComp'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'

interface CampaignRewardsBannerProps {
  chainId: ChainId
  market: LendMarketTemplate | undefined
}

export const CampaignRewardsBanner = ({ chainId, market }: CampaignRewardsBannerProps) => {
  const blockchainId = networks[chainId].id as Chain
  const { data: supplyCampaigns } = useCampaignsByAddress({
    blockchainId,
    address: market?.addresses.vault as Address | undefined,
  })
  const { data: borrowCampaigns } = useCampaignsByAddress({
    blockchainId,
    address: market?.addresses.controller as Address | undefined,
  })

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
