import { groupBy } from 'lodash'
import { Address } from '@primitives/address.utils'
import { queryOptions } from '@tanstack/react-query'
import type { CampaignRewards } from '@ui/features/campaigns/types'
import { queryFactory } from '@ui/features/queries/factory'
import { EmptyValidationSuite } from '@ui/lib/validation/lib'
import { fetchMerklRewards } from './merkl'

const { getQueryOptions, queryKey } = queryFactory({
  queryKey: () => ({ name: 'campaigns-pools-merkl', version: 2 }) as const,
  queryFn: async () =>
    await fetchMerklRewards({ mainProtocolId: 'curve', test: false, status: 'LIVE', action: 'POOL' }),
  validationSuite: EmptyValidationSuite,
  category: 'global.campaigns',
})

export const getCampaignsPoolsMerklQueryKey = queryKey

export const getCampaignsPoolsMerklOptions = (getAddress: (address: string) => Address, enabled = true) =>
  queryOptions({
    ...getQueryOptions({}, enabled),
    select: (rewards: CampaignRewards[]) =>
      groupBy(
        rewards.map(reward => ({ ...reward, address: getAddress(reward.address) })),
        reward => reward.address,
      ),
  })
