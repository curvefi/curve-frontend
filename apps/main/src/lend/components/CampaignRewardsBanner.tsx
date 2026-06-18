import { networks } from '@/lend/networks'
import { ChainId } from '@/lend/types/lend.types'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { CampaignBannerComp } from '@ui/CampaignRewards/CampaignBannerComp'
import { extraRewardType, useCampaignsByAddress } from '@ui-kit/entities/campaigns'
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
  const { data: borrowCampaigns } = useCampaignsByAddress({
    blockchainId,
    address: market?.addresses.controller as Address | undefined,
  })

  const action =
    supplyCampaigns.length && borrowCampaigns.length
      ? t`Suppling and borrowing`
      : supplyCampaigns.length
        ? t`Supplying`
        : borrowCampaigns.length
          ? t`Borrowing`
          : ''

  const rewardTypes = supplyCampaigns.concat(borrowCampaigns).map(campaign => extraRewardType(campaign))
  const hasApr = rewardTypes.includes('apr')
  const hasPoints = rewardTypes.includes('points') || rewardTypes.includes('symbol')
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
