import { groupBy, inRange } from 'lodash'
import { useMemo } from 'react'
import type { Address } from 'viem'
import type { Chain } from '@curvefi/prices-api'
import { mapRecord } from '@curvefi/prices-api/objects.util'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model'
import { campaigns, type Campaign, type CampaignPool } from '@external-rewards'

export type CampaignPoolRewards = Pick<Campaign, 'campaignName' | 'platform' | 'platformImageId' | 'dashboardLink'> &
  Pick<CampaignPool, 'action' | 'tags' | 'address' | 'network'> & {
    description: CampaignPool['description'] | null
    lock: boolean
    multiplier?: number | string // Can be 5 as parsed from "5x", or just the token like "FXN". Kept as number for sorting.
    period?: readonly [Date, Date]
  }

const REWARDS = groupBy(
  // Can't use Object.groupBy until we support ES2024
  campaigns.flatMap((campaign) =>
    campaign.pools.map((pool) => ({
      // Campaign specific properties
      campaignName: campaign.campaignName,
      platform: campaign.platform,
      platformImageId: campaign.platformImageId,
      dashboardLink: campaign.dashboardLink,

      // Pool specific properties
      ...pool,
      address: pool.address.toLocaleLowerCase() as Address,
      description: pool.description !== 'null' ? pool.description : campaign.description,
      lock: pool.lock === 'true',
      // Remove possible 'x' suffix and convert to number if numeric, otherwise keep as string
      multiplier: (() => {
        if (!pool.multiplier || pool.multiplier.trim() === '') return undefined
        const withoutSuffix = pool.multiplier.replace(/x$/i, '')
        const numericValue = Number(withoutSuffix)
        return isNaN(numericValue) ? pool.multiplier : numericValue
      })(),
      ...(+pool.campaignStart &&
        +pool.campaignEnd && {
          period: [new Date(1000 * +pool.campaignStart), new Date(1000 * +pool.campaignEnd)] as const,
        }),
    })),
  ),
  (x) => x.address,
)

/**
 * Base query for all external reward campaigns.
 *
 * Fetches all active campaigns across all networks and applies time-based filtering
 * to only include campaigns within their active period. Network filtering is intentionally
 * NOT done at the query level to avoid cache duplication and maintain a single source of truth.
 *
 * @returns TanStack Query result with all active campaigns grouped by pool address
 */
export const {
  useQuery: useCampaigns,
  getQueryOptions: getCampaignOptions,
  getQueryData: getCampaigns,
} = queryFactory({
  queryKey: () => ['external-rewards'] as const,
  queryFn: async () => {
    const now = Date.now() // refresh is handled by refetchInterval

    return mapRecord(REWARDS, (_, rewards) =>
      rewards.filter(({ period }) => {
        if (!period) return true
        const [start, end] = period
        return inRange(now, start.getTime(), end.getTime())
      }),
    )
  },
  validationSuite: EmptyValidationSuite,
  refetchInterval: '10m',
})

/**
 * Hook for accessing all external campaigns filtered by network.
 *
 * Uses client-side filtering to avoid cache duplication and maintain a single source of truth.
 * All campaign data comes from the base `useCampaigns` query and is filtered using `useMemo`.
 *
 * @param blockchainId - Chain identifier to filter campaigns by network
 * @returns TanStack Query result with campaigns filtered by the specified network
 *
 * @example
 * ```typescript
 * const { data: ethereumCampaigns } = useCampaignsByNetwork('ethereum')
 * ```
 */
export const useCampaignsByNetwork = (blockchainId: Chain) => {
  const { data: allCampaigns, ...rest } = useCampaigns({})

  const filteredCampaigns = useMemo(() => {
    if (!blockchainId) return allCampaigns
    if (!allCampaigns) return undefined

    return mapRecord(allCampaigns, (_, rewards) => rewards.filter(({ network }) => network === blockchainId))
  }, [allCampaigns, blockchainId])

  return { data: filteredCampaigns, ...rest }
}
