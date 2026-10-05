import { queryFactory } from '@ui/features/queries/factory'
import { EmptyValidationSuite } from '@ui/lib/validation/lib'
import { fetchMerklRewards } from './merkl'

export const { getQueryOptions: getCampaignsMarketsMerklOptions } = queryFactory({
  queryKey: () => ({ name: 'campaigns-markets-merkl', version: 1 }) as const,
  queryFn: async () => await fetchMerklRewards({ mainProtocolId: 'llamalend', test: false, status: 'LIVE' }),
  validationSuite: EmptyValidationSuite,
  category: 'global.campaigns',
})
