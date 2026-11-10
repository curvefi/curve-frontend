import { capitalize } from 'lodash'
import { networks } from '@/lend/networks'
import { ChainId } from '@/lend/types/lend.types'
import { useMarketCampaignsByAddress } from '@/llamalend/features/market-advanced-information/hooks/useMarketCampaignsByAddress'
import { getControllerAddress, getVaultAddress } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { Chain } from '@curvefi/prices-api'
import { CampaignBannerComp } from '@legacy-ui/CampaignRewards/CampaignBannerComp'
import { notFalsy } from '@primitives/objects.utils'
import { t } from '@ui/lib/i18n'

type CampaignRewardsBannerProps = { chainId: ChainId; market: LendMarketTemplate | undefined }

export const CampaignRewardsBanner = ({ chainId, market }: CampaignRewardsBannerProps) => {
  const blockchainId = networks[chainId].blockchainId as Chain
  const { data: supplyCampaigns } = useMarketCampaignsByAddress({ blockchainId, address: getVaultAddress(market) })
  const { data: borrowCampaigns } = useMarketCampaignsByAddress({ blockchainId, address: getControllerAddress(market) })

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
