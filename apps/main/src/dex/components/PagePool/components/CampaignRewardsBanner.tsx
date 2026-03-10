import { useNetworkByChain } from '@/dex/entities/networks'
import type { ChainId } from '@/dex/types/main.types'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { CampaignBannerComp } from '@ui/CampaignRewards/CampaignBannerComp'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'

interface CampaignRewardsBannerProps {
  chainId: ChainId
  address: string
}

export const CampaignRewardsBanner = ({ chainId, address }: CampaignRewardsBannerProps) => {
  const { data: network } = useNetworkByChain({ chainId })
  const { data: campaigns } = useCampaignsByAddress({
    blockchainId: network.networkId as Chain,
    address: address as Address,
  })
  const message = campaigns.some((campaign) => campaign.tags.includes('points'))
    ? t`Liquidity providers in this pool also earn points!`
    : t`Liquidity providers in this pool also earn additional tokens!`
  return campaigns.length > 0 && <CampaignBannerComp campaignRewardsPool={campaigns} message={message} />
}
