import { networks } from '@/lend/networks'
import { ChainId } from '@/lend/types/lend.types'
import { getControllerAddress } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { notFalsy } from '@primitives/objects.utils'
import { CampaignBannerComp } from '@ui/CampaignRewards/CampaignBannerComp'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'

type CampaignRewardsBannerProps = {
  chainId: ChainId
  market: LendMarketTemplate | undefined
}

export const CampaignRewardsBanner = ({ chainId, market }: CampaignRewardsBannerProps) => {
  const blockchainId = networks[chainId].id as Chain
  const { data: supplyCampaigns } = useCampaignsByAddress({
    blockchainId,
    address: market?.addresses.vault as Address | undefined,
  })
  const { data: borrowCampaigns } = useCampaignsByAddress({ blockchainId, address: getControllerAddress(market) })

  const action =
    supplyCampaigns.length && borrowCampaigns.length
      ? t`Suppling and borrowing`
      : supplyCampaigns.length
        ? t`Supplying`
        : borrowCampaigns.length
          ? t`Borrowing`
          : ''

  const rewardTypes = notFalsy(...supplyCampaigns.concat(borrowCampaigns).map(campaign => campaign.reward?.type))
  const hasApr = rewardTypes.includes('apr')
  const hasPoints = rewardTypes.includes('points')
  const rewardType = hasApr && hasPoints ? t`yield / points` : hasApr ? t`yield` : hasPoints ? t`points` : ''

  return (
    supplyCampaigns.length + borrowCampaigns.length > 0 && (
      <CampaignBannerComp
        campaignRewards={[...supplyCampaigns, ...borrowCampaigns]}
        message={t`${action} in this market earns ${rewardType}`}
      />
    )
  )
}
