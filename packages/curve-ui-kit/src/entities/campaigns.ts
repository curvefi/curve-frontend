import lodash from 'lodash'
import { useMemo } from 'react'
import { CampaignRewardsItem, type CampaignRewardsPool, RewardsAction, RewardsTags } from '@ui/CampaignRewards/types'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model'
import { MarketType, MarketRateType } from '@ui-kit/types/market'
import campaigns from '@external-rewards'

export type PoolRewards = {
  action: RewardsAction
  multiplier: string // usually formatted like '1x', but it might be just a string
  tags: RewardsTags[]
  description: string | null
  platformImageId: string
  period?: readonly [Date, Date]
  dashboardLink: string
}

const REWARDS: Record<string, PoolRewards[]> = campaigns.reduce(
  (result, { pools, platformImageId, dashboardLink }: CampaignRewardsItem) => ({
    ...result,
    ...pools.reduce(
      (
        result: Record<string, PoolRewards[]>,
        { address, multiplier, tags, action, description, campaignStart, campaignEnd }: CampaignRewardsPool,
      ) => ({
        ...result,
        [address.toLowerCase()]: [
          ...(result[address.toLowerCase()] ?? []),
          {
            dashboardLink,
            multiplier,
            tags,
            action,
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

export const { getQueryOptions: getCampaignsOptions } = queryFactory({
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

export const useFilteredRewards = (rewards: PoolRewards[], marketType: MarketType, rateType: MarketRateType) =>
  useMemo(() => {
    const rewardsAction = rateType == 'borrow' ? (marketType === 'mint' ? 'loan' : 'borrow') : 'supply'
    return rewards.filter(({ action }) => action == rewardsAction)
  }, [rewards, marketType, rateType])
