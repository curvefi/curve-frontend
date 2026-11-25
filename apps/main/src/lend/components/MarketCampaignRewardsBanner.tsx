import { capitalize } from 'lodash'
import { networks } from '@/lend/networks'
import { ChainId } from '@/lend/types/lend.types'
import { useMarketCampaignsByAddress } from '@/llamalend/features/market-advanced-information/hooks/useMarketCampaignsByAddress'
import { getControllerAddress, getVaultAddress } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { Chain } from '@curvefi/prices-api'
import { notFalsy } from '@primitives/objects.utils'
import { CampaignRewardsBanner } from '@ui/features/campaigns/CampaignRewardsBanner'
import { t } from '@ui/lib/i18n'

type MarketCampaignRewardsBannerProps = { chainId: ChainId; market: LendMarketTemplate | undefined }

export const MarketCampaignRewardsBanner = ({ chainId, market }: MarketCampaignRewardsBannerProps) => {
  const blockchainId = networks[chainId].blockchainId as Chain
  const { data: supplyCampaigns } = useMarketCampaignsByAddress({ blockchainId, address: getVaultAddress(market) })
  const { data: borrowCampaigns } = useMarketCampaignsByAddress({ blockchainId, address: getControllerAddress(market) })

  const action = notFalsy(supplyCampaigns.length && t`supplying`, borrowCampaigns.length && t`borrowing`).join(' and ')
  const rewardTypes = notFalsy(...supplyCampaigns.concat(borrowCampaigns).map(campaign => campaign.reward?.type))
  const rewardType = notFalsy(
    rewardTypes.includes('apr') && t`yield`,
    rewardTypes.includes('points') && t`points`,
  ).join(' / ')
  return (
    supplyCampaigns.length + borrowCampaigns.length > 0 && (
      <CampaignRewardsBanner
        campaignRewards={[...supplyCampaigns, ...borrowCampaigns]}
        message={t`${capitalize(action)} in this market earns ${rewardType}`}
      />
    )
  )
}
