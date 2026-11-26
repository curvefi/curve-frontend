import { usePoolContext } from '@/dex/features/pool-context'
import { usePoolCampaignsByAddress } from '@/dex/features/pool-information/hooks/usePoolCampaignsByAddress'
import { CampaignRewardsBanner } from '@ui/features/campaigns/CampaignRewardsBanner'
import { t } from '@ui/lib/i18n'

export const PoolCampaignRewardsBanner = () => {
  const { blockchainId, poolAddress } = usePoolContext()
  const { data: campaigns } = usePoolCampaignsByAddress({ blockchainId, address: poolAddress })
  const hasPoints = campaigns.some(campaign => campaign.tags.includes('points'))
  return (
    campaigns.length > 0 && (
      <CampaignRewardsBanner
        campaignRewards={campaigns}
        message={t`Liquidity providers in this pool also earn ${hasPoints ? t`points` : t`additional tokens`}!`}
      />
    )
  )
}
