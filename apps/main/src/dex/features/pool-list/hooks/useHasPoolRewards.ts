import { sum } from 'lodash'
import type { RewardsApy } from '@/dex/types/main.types'
import type { Chain } from '@curvefi/prices-api'
import type { Address } from '@primitives/address.utils'
import { useCampaignsByAddress } from '@ui-kit/entities/campaigns'
import type { PoolListItem } from '../types'

export const hasCrvRewards = (rewards: RewardsApy | undefined) => sum(rewards?.crv) > 0

export const useHasPoolRewards = (rewards: RewardsApy | undefined, poolData: PoolListItem) => {
  const { data: campaigns } = useCampaignsByAddress({
    blockchainId: poolData.network as Chain,
    address: poolData?.pool?.address as Address,
  })

  return {
    hasCrv: hasCrvRewards(rewards),
    hasIncentives: rewards?.other?.length || campaigns.length > 0,
    campaigns,
  }
}
