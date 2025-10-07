import { useMemo } from 'react'
import type { Address } from 'viem'
import type { Chain } from '@curvefi/prices-api'
import { fromEntries, notFalsy, objectKeys } from '@curvefi/prices-api/objects.util'
import { useQueries } from '@tanstack/react-query'
import { combineQueriesMeta } from '@ui-kit/lib'
import { getCampaignsExternalOptions } from './campaigns-external'
import { getCampaignsMerklOptions } from './campaigns-merkl'
import type { CampaignPoolRewards, Campaigns } from './types'

/**
 * Combines multiple campaign records into a single record, merging campaigns by address.
 *
 * When the same address appears in multiple campaign sources, all rewards are merged into a single array.
 * Addresses with no campaigns after filtering are automatically excluded.
 *
 * @param campaigns - Array of campaign records to combine (undefined values are filtered out)
 * @param filter - Optional filter function to apply to individual campaigns before grouping
 * @returns Combined record with all campaigns merged by address
 *
 * @example
 * ```typescript
 * // Combine and filter by network
 * const ethereumCampaigns = combineCampaigns({
 *   campaigns: [externalCampaigns, merklCampaigns],
 *   filter: (campaign) => campaign.network === 'ethereum'
 * })
 * ```
 */
export const combineCampaigns = ({
  campaigns,
  filter,
}: {
  campaigns: (Campaigns | undefined)[]
  filter?: (campaign: CampaignPoolRewards) => boolean
}): Campaigns => {
  // Get all unique addresses from all campaign sources
  const allAddresses = new Set(notFalsy(...campaigns).flatMap(objectKeys))

  // Combine campaigns by address, applying optional filter
  return fromEntries(
    [...allAddresses]
      .map((address) => {
        const allRewards = campaigns
          .filter((record): record is Campaigns => record !== undefined)
          .flatMap((record) => record[address] || [])

        const filteredRewards = filter ? allRewards.filter(filter) : allRewards

        return [address, filteredRewards] as const
      })
      // Only include campaigns that have rewards after filtering
      .filter(([_, rewards]) => rewards.length > 0),
  )
}

type UseCampaignsOptions = { blockchainId?: Chain }

/**
 * Hook for accessing all campaigns, optionally filtered by network.
 *
 * @param options.blockchainId - Optional chain identifier to filter campaigns by network
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
    queries: [getCampaignsExternalOptions({}), getCampaignsMerklOptions({})],
    combine: (campaigns) => ({
      ...combineQueriesMeta(campaigns),
      // Combine campaigns with optional network filter
      data: combineCampaigns({
        campaigns: campaigns.map((campaign) => campaign.data),
        filter: blockchainId ? (campaign) => campaign.network === blockchainId : undefined,
      }),
    }),
  })

/**
 * Hook for accessing campaigns for a specific campaign address, optionally filtered by network.
 *
 * @param options.address - Address to get campaigns for
 * @param options.blockchainId - Optional chain identifier to filter campaigns by network
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
  ...useCampaignOptions
}: { address: Address | undefined } & UseCampaignsOptions) => {
  const { data: campaigns, ...queryData } = useCampaigns(useCampaignOptions)
  const rewards = useMemo(() => (address && campaigns[address]) || [], [address, campaigns])

  return {
    ...queryData,
    data: rewards,
  }
}
