import { useNetworkByChain } from '@/dex/entities/networks'
import type { ChainId } from '@/dex/types/main.types'
import { useCampaignsByAddress } from '@evm-ui/entities/campaigns'
import { CampaignBannerComp } from '@legacy-ui/CampaignRewards/CampaignBannerComp'
import type { Address } from '@primitives/address.utils'
import { t } from '@ui/lib/i18n'

type CampaignRewardsBannerProps = {
  chainId: ChainId
  address: string
}

export const CampaignRewardsBanner = ({ chainId, address }: CampaignRewardsBannerProps) => {
  const { data: network } = useNetworkByChain({ chainId })
  const { data: campaigns } = useCampaignsByAddress({
    blockchainId: network.blockchainId,
    address: address as Address,
  })
  const message = campaigns.some(campaign => campaign.tags.includes('points'))
    ? t`Liquidity providers in this pool also earn points!`
    : t`Liquidity providers in this pool also earn additional tokens!`
  return campaigns.length > 0 && <CampaignBannerComp campaignRewards={campaigns} message={message} />
}
