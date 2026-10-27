import { useCallback } from 'react'
import { getAddress } from 'viem'
import type { Address } from '@primitives/address.utils'
import type { QueriesResults } from '@tanstack/react-query'
import { queryOptions } from '@tanstack/react-query'
import { getCampaignsExternalOptions } from '@ui/features/campaigns/campaigns-external.query'
import { getCampaignsPoolsMerklOptions } from '@ui/features/campaigns/campaigns-pools-merkl.query'
import { combineCampaigns } from '@ui/features/campaigns/campaigns.query'
import { groupCampaignsByAddress } from '@ui/features/campaigns/campaigns.utils'
import { combineQueryState } from '@ui/features/queries/combine'
import { useQueries } from '@ui/features/queries/query-hooks'

const getMerklOptions = (formatAddress: (address: string) => Address, enabled = true) =>
  queryOptions({ ...getCampaignsPoolsMerklOptions({}, enabled), select: groupCampaignsByAddress(formatAddress) })

/**
 * Hook for accessing the DEX pool campaigns, optionally filtered by network.
 */
export const usePoolCampaigns = ({ blockchainId }: { blockchainId: string }) =>
  useQueries({
    queries: [getCampaignsExternalOptions(getAddress), getMerklOptions(getAddress)],
    combine: useCallback(
      ([external, merklPools]: QueriesResults<
        [ReturnType<typeof getCampaignsExternalOptions>, ReturnType<typeof getMerklOptions>]
      >) => ({
        ...combineQueryState(external, merklPools),
        // Combine campaigns with an optional network filter
        data: combineCampaigns([external.data, merklPools.data], blockchainId),
      }),
      [blockchainId],
    ),
  })
