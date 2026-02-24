import { groupBy, inRange } from 'lodash'
import type { Address } from 'viem'
import { mapRecord } from '@curvefi/primitives/objects.utils'
import { CURVE_ASSETS_URL } from '@ui/utils'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model'
import { campaigns } from '@external-rewards'

const REWARDS = groupBy(
  // Can't use Object.groupBy until we support ES2024
  campaigns.flatMap((campaign) =>
    campaign.pools.map((pool) => ({
      // Campaign specific properties
      campaignName: campaign.campaignName,
      platform: campaign.platform,
      platformImageId: `${CURVE_ASSETS_URL}/platforms/${campaign.platformImageId}`,
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
export const { getQueryOptions: getCampaignsExternalOptions } = queryFactory({
  queryKey: () => ['campaigns-external'] as const,
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
