import { useCallback } from 'react'
import { getAddress } from 'viem'
import { getCampaignsExternalOptions } from '@evm-ui/queries/campaigns/campaigns-external.query'
import { getCampaignsMarketsMerklOptions } from '@evm-ui/queries/campaigns/campaigns-markets-merkl.query'
import { combineCampaigns } from '@evm-ui/queries/campaigns/campaigns.query'
import type { Nullish } from '@primitives/objects.utils'
import type { QueriesResults } from '@tanstack/react-query'
import { combineQueryState } from '@ui/features/queries/combine'
import { useQueries } from '@ui/features/queries/query-hooks'

export const useMarketCampaigns = ({ blockchainId }: { blockchainId: string | Nullish }) =>
  useQueries({
    queries: [getCampaignsExternalOptions(getAddress), getCampaignsMarketsMerklOptions(getAddress)],
    combine: useCallback(
      ([external, merklMarkets]: QueriesResults<
        [ReturnType<typeof getCampaignsExternalOptions>, ReturnType<typeof getCampaignsMarketsMerklOptions>]
      >) => ({
        ...combineQueryState(external, merklMarkets),
        data: combineCampaigns([external.data, merklMarkets.data], blockchainId),
      }),
      [blockchainId],
    ),
  })
