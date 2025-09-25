import { styled } from 'styled-components'
import CampaignBannerComp from 'ui/src/CampaignRewards/CampaignBannerComp'
import { useCampaigns } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'

interface CampaignRewardsBannerProps {
  address: string
}

const CampaignRewardsBanner = ({ address }: CampaignRewardsBannerProps) => {
  const { data: campaigns } = useCampaigns({})
  const campaignRewardsPool = campaigns?.[address]

  if (!campaignRewardsPool) return null

  const isPoints = campaignRewardsPool && campaignRewardsPool.some((rewardItem) => rewardItem.tags.includes('points'))

  const bannerMessage = () => {
    if (isPoints) return t`Liquidity providers in this pool also earn points!`
    return t`Liquidity providers in this pool also earn additional tokens!`
  }

  return (
    <CampaignRewardsBannerWrapper>
      <CampaignBannerComp campaignRewardsPool={campaignRewardsPool} message={bannerMessage()} />
    </CampaignRewardsBannerWrapper>
  )
}

const CampaignRewardsBannerWrapper = styled.div`
  margin: 0 0 var(--spacing-2) 0;
`

export default CampaignRewardsBanner
