import { groupBy, inRange } from 'lodash'
import { Address } from '@primitives/address.utils'
import { queryOptions } from '@tanstack/react-query'
import type { CampaignRewards } from '@ui/features/campaigns/types'
import { queryFactory } from '@ui/features/queries/factory'
import { CURVE_ASSETS_URL } from '@ui/lib/resource.constants'
import { EmptyValidationSuite } from '@ui/lib/validation/lib'
import { campaigns } from '@external-rewards'

const REWARDS = campaigns.flatMap(campaign =>
  campaign.pools.map<CampaignRewards>(pool => ({
    isMerkl: false,
    // Campaign specific properties
    campaignName: campaign.campaignName,
    platform: campaign.platform,
    platformImageId: `${CURVE_ASSETS_URL}/platforms/${campaign.platformImageId}`,
    dashboardLink: campaign.dashboardLink,

    // Pool specific properties
    ...pool,
    description: pool.description !== 'null' ? pool.description : campaign.description,
    lock: pool.lock === 'true',
    // Remove possible 'x' suffix and convert to number if numeric, otherwise keep as symbol string
    ...(() => {
      if (!pool.multiplier || pool.multiplier.trim() === '') return undefined
      const withoutSuffix = pool.multiplier.replace(/x$/i, '')
      const numericValue = Number(withoutSuffix)
      return isNaN(numericValue) ? { symbol: pool.multiplier } : { reward: { type: 'points', value: numericValue } }
    })(),
    ...(+pool.campaignStart &&
      +pool.campaignEnd && {
        period: [new Date(1000 * +pool.campaignStart), new Date(1000 * +pool.campaignEnd)] as const,
      }),
  })),
)

/**
 * Base query for all external reward campaigns, both pools and markets.
 *
 * Fetches all active campaigns across all networks and applies time-based filtering
 * to only include campaigns within their active period. Network filtering is intentionally
 * NOT done at the query level to avoid cache duplication and maintain a single source of truth.
 *
 * @returns TanStack Query result with all active campaigns grouped by pool address
 */
const { getQueryOptions, queryKey } = queryFactory({
  queryKey: () => ({ name: 'campaigns-external', version: 1 }) as const,
  // eslint-disable-next-line @typescript-eslint/require-await -- Existing violation before enabling this rule.
  queryFn: async () => {
    const now = Date.now() // refresh is handled by refetchInterval
    return REWARDS.filter(({ period }) => {
      if (!period) return true
      const [start, end] = period
      return inRange(now, start.getTime(), end.getTime())
    })
  },
  validationSuite: EmptyValidationSuite,
  category: 'global.campaigns',
})

export const getCampaignsExternalQueryKey = queryKey

export const getCampaignsExternalOptions = (getAddress: (address: string) => Address, enabled = true) =>
  queryOptions({
    ...getQueryOptions({}, enabled),
    select: (rewards: CampaignRewards[]) =>
      groupBy(
        rewards.map(reward => ({ ...reward, address: getAddress(reward.address) })),
        reward => reward.address,
      ),
  })
