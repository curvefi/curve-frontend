import { usePoolContext } from '@/dex/features/pool-context'
import { useCampaignsByAddress } from '@evm-ui/entities/campaigns'
import { CampaignBannerComp } from '@legacy-ui/CampaignRewards/CampaignBannerComp'
import { t } from '@ui/lib/i18n'

export const CampaignRewardsBanner = () => {
  const { blockchainId, poolAddress } = usePoolContext()
  const { data: campaigns } = useCampaignsByAddress({ blockchainId, address: poolAddress })

  const message = campaigns.some(campaign => campaign.tags.includes('points'))
    ? t`Liquidity providers in this pool also earn points!`
    : t`Liquidity providers in this pool also earn additional tokens!`

  return campaigns.length > 0 && <CampaignBannerComp campaignRewards={campaigns} message={message} />
}
