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

const REWARDS: Record<string, CampaignPoolRewards[]> = campaigns.reduce(
  (campaigns, { pools, campaignName, platform, platformImageId, dashboardLink, ...campaign }) => ({
    ...campaigns,
    ...pools.reduce(
      (pools: Record<string, CampaignPoolRewards[]>, { address, campaignStart, campaignEnd, ...pool }) => ({
        ...pools,
        [address.toLowerCase()]: [
          ...(pools[address.toLowerCase()] ?? []),
          {
            campaignName,
            platform,
            platformImageId,
            dashboardLink,
            ...pool,
            description: pool.description !== 'null' ? pool.description : campaign.description,
            lock: pool.lock === 'true',
            address: address.toLowerCase(),
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
