import { EmptyValidationSuite } from '@evm-ui/lib'
import { queryFactory } from '@evm-ui/lib/model'
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
