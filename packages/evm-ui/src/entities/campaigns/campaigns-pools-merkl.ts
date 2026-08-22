import { EmptyValidationSuite } from '@evm-ui/lib'
import { queryFactory } from '@evm-ui/lib/model'
import { fetchMerklRewards } from './merkl'

export const { getQueryOptions: getCampaignsPoolsMerklOptions } = queryFactory({
  queryKey: () => ['campaigns-pools-merkl'] as const,
  queryFn: async () =>
    await fetchMerklRewards({
      mainProtocolId: 'curve',
      test: false,
      status: 'LIVE',
      action: 'POOL',
    }),
  validationSuite: EmptyValidationSuite,
  category: 'global.campaigns',
})
