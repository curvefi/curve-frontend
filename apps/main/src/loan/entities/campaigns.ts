import campaigns from '@external-rewards'
import { CampaignRewardsItem, RewardsAction, RewardsTags } from '@ui/CampaignRewards/types'
import { queryFactory } from '@ui-kit/lib/model'
import { EmptyValidationSuite } from '@ui-kit/lib'

export type PoolRewards = {
  action: RewardsAction
  multiplier: number
  tags: RewardsTags[]
  description: string | null
}

export const { getQueryOptions: getCampaignsOptions } = queryFactory({
  queryKey: () => ['external-rewards', 'v1'] as const,
  queryFn: async (): Promise<Record<string, PoolRewards>> =>
    Object.fromEntries(
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
    ),
  staleTime: '5m',
  validationSuite: EmptyValidationSuite,
})
