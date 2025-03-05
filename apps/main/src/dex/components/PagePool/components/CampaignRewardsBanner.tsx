import { t } from '@ui-kit/lib/i18n'
import styled from 'styled-components'
import useCampaignRewardsMapper from '@/dex/hooks/useCampaignRewardsMapper'
import CampaignBannerComp from 'ui/src/CampaignRewards/CampaignBannerComp'

interface CampaignRewardsBannerProps {
  address: string
}

const CampaignRewardsBanner = ({ address }: CampaignRewardsBannerProps) => {
  const campaignRewardsPool = useCampaignRewardsMapper()[address]

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
