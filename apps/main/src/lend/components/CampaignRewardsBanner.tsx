import { networks } from '@/lend/networks'
import { ChainId } from '@/lend/types/lend.types'
import { getControllerAddress, getVaultAddress } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { Chain } from '@curvefi/prices-api'
import { notFalsy } from '@primitives/objects.utils'
import { capitalize } from '@primitives/string.utils'
import { CampaignBannerComp } from '@ui/CampaignRewards/CampaignBannerComp'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'

type CampaignRewardsBannerProps = {
  chainId: ChainId
  market: LendMarketTemplate | undefined
}

export const CampaignRewardsBanner = ({ chainId, market }: CampaignRewardsBannerProps) => {
  const blockchainId = networks[chainId].id as Chain
  const { data: supplyCampaigns } = useCampaignsByAddress({ blockchainId, address: getVaultAddress(market) })
  const { data: borrowCampaigns } = useCampaignsByAddress({ blockchainId, address: getControllerAddress(market) })

  const action = notFalsy(supplyCampaigns.length && t`supplying`, borrowCampaigns.length && t`borrowing`).join(' and ')

  const rewardTypes = notFalsy(...supplyCampaigns.concat(borrowCampaigns).map(campaign => campaign.reward?.type))
  const hasApr = rewardTypes.includes('apr')
  const hasPoints = rewardTypes.includes('points')
  const rewardType = hasApr && hasPoints ? t`yield / points` : hasApr ? t`yield` : hasPoints ? t`points` : ''

  return (
    supplyCampaigns.length + borrowCampaigns.length > 0 && (
      <CampaignBannerComp
        campaignRewards={[...supplyCampaigns, ...borrowCampaigns]}
        message={t`${capitalize(action)} in this market earns ${rewardType}`}
      />
    )
  )
}
