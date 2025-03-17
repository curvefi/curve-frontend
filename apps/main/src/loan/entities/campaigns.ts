import { CampaignRewardsItem, type CampaignRewardsPool, RewardsAction, RewardsTags } from '@ui/CampaignRewards/types'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model'
import campaigns from '@external-rewards'

export type PoolRewards = {
  action: RewardsAction
  multiplier: string // usually formatted like '1x', but it might be just a string
  tags: RewardsTags[]
  description: string | null
}

const REWARDS: Record<string, PoolRewards[]> = campaigns.reduce(
  (result, { pools }: CampaignRewardsItem) => ({
    ...result,
    ...pools.reduce(
      (
        result: Record<string, PoolRewards[]>,
        { address, multiplier, tags, action, description }: CampaignRewardsPool,
      ) => ({
        ...result,
        [address.toLowerCase()]: [
          ...(result[address.toLowerCase()] ?? []),
          {
            multiplier,
            tags,
            action,
            description: description === 'null' ? null : description,
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
  queryFn: async () => REWARDS,
  validationSuite: EmptyValidationSuite,
})
