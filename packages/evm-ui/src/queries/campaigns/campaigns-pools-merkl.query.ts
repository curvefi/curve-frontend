import { queryFactory } from '@ui/features/queries/factory'
import { EmptyValidationSuite } from '@ui/lib/validation/lib'
import { fetchMerklRewards } from './merkl'

export const { getQueryOptions: getCampaignsPoolsMerklOptions, queryKey: getCampaignsPoolsMerklQueryKey } =
  queryFactory({
    queryKey: () => [{ name: 'campaigns-pools-merkl' }] as const,
    queryFn: async () =>
      await fetchMerklRewards({ mainProtocolId: 'curve', test: false, status: 'LIVE', action: 'POOL' }),
    validationSuite: EmptyValidationSuite,
    category: 'global.campaigns',
  })
