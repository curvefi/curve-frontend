import lodash from 'lodash'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model'
import { campaigns, type Campaign, type CampaignPool } from '@external-rewards'

export type CampaignPoolRewards = Pick<Campaign, 'campaignName' | 'platform' | 'platformImageId' | 'dashboardLink'> &
  Pick<CampaignPool, 'action' | 'multiplier' | 'tags' | 'address'> & {
    description: CampaignPool['description'] | null
    period?: readonly [Date, Date]
    lock: boolean
  }

const REWARDS = campaigns.reduce<Record<string, CampaignPoolRewards[]>>(
  (campaigns, campaign) => ({
    ...campaigns,
    ...campaign.pools.reduce<Record<string, CampaignPoolRewards[]>>(
      (pools, pool) => ({
        ...pools,
        [pool.address.toLowerCase()]: [
          ...(pools[pool.address.toLowerCase()] ?? []),
          {
            // Campaign specific properties
            campaignName: campaign.campaignName,
            platform: campaign.platform,
            platformImageId: campaign.platformImageId,
            dashboardLink: campaign.dashboardLink,

            // Pool specific properties
            ...pool,
            description: pool.description !== 'null' ? pool.description : campaign.description,
            lock: pool.lock === 'true',
            address: pool.address.toLowerCase(),
            ...(+pool.campaignStart &&
              +pool.campaignEnd && {
                period: [new Date(1000 * +pool.campaignStart), new Date(1000 * +pool.campaignEnd)] as const,
              }),
          },
        ],
      }),
      {},
    ),
  }),
  {},
)

export const {
  useQuery: useCampaigns,
  getQueryOptions: getCampaignOptions,
  getQueryData: getCampaigns,
} = queryFactory({
  queryKey: () => ['external-rewards', 'v2'] as const,
  queryFn: async (): Promise<Record<string, CampaignPoolRewards[]>> => {
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
