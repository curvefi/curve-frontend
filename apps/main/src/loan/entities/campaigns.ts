import { CampaignRewardsItem, RewardsAction, RewardsTags } from '@ui/CampaignRewards/types'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model'
import campaigns from '@external-rewards'

export type PoolRewards = {
  action: RewardsAction
  multiplier: number
  tags: RewardsTags[]
  description: string | null
}

const REWARDS: Record<string, PoolRewards> = Object.fromEntries(
  campaigns.flatMap(({ pools }: CampaignRewardsItem) =>
    pools.map(({ address, multiplier, tags, action, description }) => [
      address.toLowerCase(),
      {
        multiplier: parseFloat(multiplier),
        tags,
        action,
        description: description === 'null' ? null : description,
      },
    ]),
  ),
)

export const { getQueryOptions: getCampaignsOptions } = queryFactory({
  queryKey: () => ['external-rewards', 'v1'] as const,
  queryFn: async () => REWARDS,
  staleTime: '5m',
  validationSuite: EmptyValidationSuite,
})
