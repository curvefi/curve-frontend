import lodash from 'lodash'
import { queryFactory, type ChainNameParams, type ChainNameQuery } from '@ui-kit/lib/model'
import { chainNameValidationSuite } from '@ui-kit/lib/model/query/chain-name-validation'
import { campaigns, type Campaign, type CampaignPool } from '@external-rewards'

export type CampaignPoolRewards = Pick<Campaign, 'campaignName' | 'platform' | 'platformImageId' | 'dashboardLink'> &
  Pick<CampaignPool, 'action' | 'tags' | 'address' | 'network'> & {
    description: CampaignPool['description'] | null
    lock: boolean
    multiplier?: number
    period?: readonly [Date, Date]
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
            address: pool.address.toLowerCase(),
            description: pool.description !== 'null' ? pool.description : campaign.description,
            lock: pool.lock === 'true',
            // Remove possible 'x' suffix and convert to number
            multiplier: Number(pool.multiplier.replace(/x$/i, '')),
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
  queryKey: ({ blockchainId }: ChainNameParams) => ['external-rewards', { blockchainId }] as const,
  queryFn: async ({ blockchainId }: ChainNameQuery) => {
    const now = Date.now() // refresh is handled by refetchInterval
    return Object.fromEntries(
      Object.entries(REWARDS).map(([address, rewards]) => [
        address,
        rewards
          .filter(({ period }) => {
            if (!period) return true
            const [start, end] = period
            return lodash.inRange(now, start.getTime(), end.getTime())
          })
          .filter(({ network }) => network === blockchainId),
      ]),
    )
  },
  validationSuite: chainNameValidationSuite,
  refetchInterval: '10m',
})
