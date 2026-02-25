import memoizee from 'memoizee'
import { useCallback, useMemo } from 'react'
import type { Address } from 'viem'
import type { Chain } from '@curvefi/prices-api'
import { fromEntries, notFalsy, objectKeys } from '@primitives/objects.utils'
import { type QueriesResults, useQueries } from '@tanstack/react-query'
import { combineQueriesMeta } from '@ui-kit/lib'
import { getCampaignsExternalOptions } from './campaigns-external'
import { getCampaignsMerklOptions } from './campaigns-merkl'
import type { Campaigns } from './types'

/**
 * Combines multiple campaign records into a single record, merging campaigns by address.
 *
 * When the same address appears in multiple campaign sources, all rewards are merged into a single array.
 * Addresses with no campaigns after filtering are automatically excluded.
 *
 * The function is memoized because Tanstack will call `combine` on every usage of `useQueries`,
 *
 * @param campaigns - Array of campaign records to combine (undefined values are filtered out)
 * @param filter - Optional filter function to apply to individual campaigns before grouping
 * @returns Combined record with all campaigns merged by address
 */
export const combineCampaigns = memoizee(
  (external: Campaigns | undefined, merkl: Campaigns | undefined, network?: string): Campaigns => {
    const campaigns = [external, merkl]
    // Get all unique addresses from all campaign sources
    const allAddresses = new Set(notFalsy(...campaigns).flatMap(objectKeys))

    // Combine campaigns by address, applying optional filter
    return fromEntries(
      [...allAddresses]
        .map((address) => {
          const allRewards = campaigns
            .filter((record): record is Campaigns => record !== undefined)
            .flatMap((record) => record[address] || [])

          const filteredRewards = network ? allRewards.filter((r) => r.network === network) : allRewards

          return [address, filteredRewards] as const
        })
        // Only include campaigns that have rewards after filtering
        .filter(([_, rewards]) => rewards.length > 0),
    )
  },
)

type UseCampaignsOptions = { blockchainId?: Chain; enabled?: boolean }

type CampaignQueries = [ReturnType<typeof getCampaignsExternalOptions>, ReturnType<typeof getCampaignsMerklOptions>]
const queries: CampaignQueries = [getCampaignsExternalOptions({}), getCampaignsMerklOptions({})]

/**
 * Hook for accessing all campaigns, optionally filtered by network.
 *
 * @param blockchainId - Optional chain identifier to filter campaigns by network
 *
 * @example
 * ```typescript
 * // Get all campaigns from all networks
 * const { data: allCampaigns } = useCampaigns()
 *
 * // Get campaigns filtered by network
 * const { data: ethereumCampaigns } = useCampaigns({
 *   blockchainId: 'ethereum'
 * })
 *
 * // Access campaigns for a specific pool address
 * const poolCampaigns = ethereumCampaigns['0x123...'] || []
 * ```
 */
const useCampaigns = ({ blockchainId }: UseCampaignsOptions = {}) =>
  useQueries({
    queries,
    combine: useCallback(
      ([external, merkl]: QueriesResults<CampaignQueries>) => ({
        ...combineQueriesMeta([external, merkl]),
        // Combine campaigns with an optional network filter
        data: combineCampaigns(external.data, merkl.data, blockchainId),
      }),
      [blockchainId],
    ),
  })

/**
 * Hook for accessing campaigns for a specific campaign address, optionally filtered by network.
 *
 * @param address - Address to get campaigns for
 * @param blockchainId - Optional chain identifier to filter campaigns by network
 *
 * @example
 * ```typescript
 * const { data: campaigns, isLoading } = useCampaignByAddress({
 *   address: '0x123...',
 *   blockchainId: 'ethereum'
 * })
 * ```
 */
export const useCampaignsByAddress = ({
  address,
  blockchainId,
}: { address: Address | undefined } & UseCampaignsOptions) => {
  const { data } = useCampaigns({ blockchainId, enabled: Boolean(address) })
  return { data: useMemo(() => (address && data[address]) || [], [address, data]) }
}
