import memoizee from 'memoizee'
import { useCallback } from 'react'
import type { Address } from '@primitives/address.utils'
import { fromEntries, notFalsy, type Nullish, objectKeys } from '@primitives/objects.utils'
import type { Campaigns } from '@ui/features/campaigns/types'
import { type Query, useMappedQuery } from '@ui/features/queries/util'

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
export const combineCampaigns = memoizee((campaigns: (Campaigns | undefined)[], network?: string | null): Campaigns =>
  fromEntries(
    // Get all unique addresses from all campaign sources
    [...new Set(notFalsy(...campaigns).flatMap(objectKeys))]
      // Combine campaigns by address, applying optional filter
      .map(address => {
        const allRewards = notFalsy(...campaigns.flatMap(record => record?.[address]))
        const filteredRewards = network ? allRewards.filter(r => r.network === network) : allRewards
        return [address, filteredRewards] as const
      })
      // Only include campaigns that have rewards after filtering
      .filter(([_, rewards]) => rewards.length > 0),
  ),
)

export const useCampaignsByAddress = (
  campaigns: Query<Campaigns>,
  { address, formatAddress }: { address: Address | Nullish; formatAddress: (address: string) => Address },
) => {
  const query = useMappedQuery(
    campaigns,
    useCallback(campaigns => address && campaigns[formatAddress(address)], [address, formatAddress]),
  )

  // TODO: Temporarily map undefined data to [], needs a proper fix
  return { ...query, data: query.data ?? [] }
}
