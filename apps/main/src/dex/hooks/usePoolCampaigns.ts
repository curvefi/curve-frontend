import { groupBy } from 'lodash'
import { useCallback } from 'react'
import { getAddress } from 'viem'
import { Address } from '@primitives/address.utils'
import type { QueriesResults } from '@tanstack/react-query'
import { queryOptions } from '@tanstack/react-query'
import { getCampaignsExternalOptions } from '@ui/features/campaigns/campaigns-external.query'
import { getCampaignsPoolsMerklOptions } from '@ui/features/campaigns/campaigns-pools-merkl.query'
import { combineCampaigns } from '@ui/features/campaigns/campaigns.query'
import type { CampaignRewards } from '@ui/features/campaigns/types'
import { combineQueryState } from '@ui/features/queries/combine'
import { useQueries } from '@ui/features/queries/query-hooks'

const getOptions = (formatAddress: (address: string) => Address, enabled = true) =>
  queryOptions({
    ...getCampaignsPoolsMerklOptions({}, enabled),
    select: (rewards: CampaignRewards[]) =>
      groupBy(
        rewards.map(reward => ({ ...reward, address: formatAddress(reward.address) })),
        reward => reward.address,
      ),
  })

/**
 * Hook for accessing the DEX pool campaigns, optionally filtered by network.
 */
export const usePoolCampaigns = ({ blockchainId }: { blockchainId: string }) =>
  useQueries({
    queries: [getCampaignsExternalOptions(getAddress), getOptions(getAddress)],
    combine: useCallback(
      ([external, merklPools]: QueriesResults<
        [ReturnType<typeof getCampaignsExternalOptions>, ReturnType<typeof getOptions>]
      >) => ({
        ...combineQueryState(external, merklPools),
        // Combine campaigns with an optional network filter
        data: combineCampaigns([external.data, merklPools.data], blockchainId),
      }),
      [blockchainId],
    ),
  })
