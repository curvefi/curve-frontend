import lodash from 'lodash'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model'
import { campaigns, type Campaign, type CampaignPool } from '@external-rewards'

export type PoolRewards = Pick<Campaign, 'platformImageId' | 'dashboardLink'> &
  Pick<CampaignPool, 'action' | 'multiplier' | 'tags'> & {
    description: string | null
    period?: readonly [Date, Date]
  }

const REWARDS: Record<string, PoolRewards[]> = campaigns.reduce(
  (campaigns, { pools, platformImageId, dashboardLink }) => ({
    ...campaigns,
    ...pools.reduce(
      (pools: Record<string, PoolRewards[]>, { address, description, campaignStart, campaignEnd, ...pool }) => ({
        ...pools,
        [address.toLowerCase()]: [
          ...(pools[address.toLowerCase()] ?? []),
          {
            ...pool,
            dashboardLink,
            description: description === 'null' ? null : description,
            platformImageId,
            ...(+campaignStart &&
              +campaignEnd && {
                period: [new Date(1000 * +campaignStart), new Date(1000 * +campaignEnd)] as const,
              }),
          },
        ],
      }),
      {},
    ),
  }),
  {},
)

export const { useQuery: useCampaigns, getQueryOptions: getCampaignOptions } = queryFactory({
  queryKey: () => ['external-rewards', 'v2'] as const,
  queryFn: async (): Promise<Record<string, PoolRewards[]>> => {
    const now = Date.now() // refresh is handled by refetchInterval
    return Object.fromEntries(
      Object.entries(REWARDS).map(([address, rewards]) => [
        address,
        rewards.filter(({ period }) => {
          if (!period) return true
          const [start, end] = period
          return lodash.inRange(now, start.getTime(), end.getTime())
        }),
      ]),
    )
  },
  validationSuite: EmptyValidationSuite,
  refetchInterval: '10m',
})
