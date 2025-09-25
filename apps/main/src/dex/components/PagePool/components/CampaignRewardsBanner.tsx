import { styled } from 'styled-components'
import CampaignBannerComp from 'ui/src/CampaignRewards/CampaignBannerComp'
import useStore from '@/dex/store/useStore'
import type { ChainId } from '@/dex/types/main.types'
import type { Chain } from '@curvefi/prices-api'
import { useCampaignsByNetwork } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'

interface CampaignRewardsBannerProps {
  chainId: ChainId
  address: string
}

const CampaignRewardsBanner = ({ chainId, address }: CampaignRewardsBannerProps) => {
  const network = useStore((state) => state.networks.networks[chainId])
  const { data: campaigns } = useCampaignsByNetwork(network.networkId as Chain)
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
