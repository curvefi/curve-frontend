import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model'
import { fetchMerklRewards } from './merkl'

export const { getQueryOptions: getCampaignsMarketsMerklOptions } = queryFactory({
  queryKey: () => ['campaigns-markets-merkl'] as const,
  queryFn: async () =>
    await fetchMerklRewards({
      mainProtocolId: 'llamalend',
      test: false,
      status: 'LIVE',
    }),
  validationSuite: EmptyValidationSuite,
  category: 'global.campaigns',
})
