import lodash from 'lodash'
import { useMemo } from 'react'
import type { Chain } from '@curvefi/prices-api'
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
  queryKey: () => ['external-rewards'] as const,
  queryFn: async () => {
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
  validationSuite: EmptyValidationSuite, //
  refetchInterval: '10m',
})

export const useCampaignsByNetwork = (blockchainId?: Chain) => {
  const { data: allCampaigns, ...rest } = useCampaigns({})

  const filteredCampaigns = useMemo(() => {
    if (!blockchainId) return allCampaigns
    if (!allCampaigns) return undefined

    return Object.fromEntries(
      Object.entries(allCampaigns).map(([address, rewards]) => [
        address,
        rewards.filter(({ network }) => network === blockchainId),
      ]),
    )
  }, [allCampaigns, blockchainId])

  return { data: filteredCampaigns, ...rest }
}
