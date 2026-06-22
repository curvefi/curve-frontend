import { sum } from 'lodash'
import type { RewardsApy } from '@/dex/types/main.types'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import type { LegacyPoolListItem } from '../legacyPoolList.types'

export const hasLegacyCrvRewards = (rewards: RewardsApy | undefined) => sum(rewards?.crv) > 0

export const useLegacyHasPoolRewards = (rewards: RewardsApy | undefined, poolData: LegacyPoolListItem) => {
  const { data: campaigns } = useCampaignsByAddress({
    blockchainId: poolData.network as Chain,
    address: poolData?.pool?.address as Address,
  })

  return {
    hasCrv: hasLegacyCrvRewards(rewards),
    hasIncentives: rewards?.other?.length || campaigns.length > 0,
    campaigns,
  }
}
