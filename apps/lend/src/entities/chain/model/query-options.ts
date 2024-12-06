import { queryOneWayMarketNames } from '@/entities/chain/api/markets-query'
import { chainValidationSuite } from '@/entities/chain/model/validation'
import { ChainParams, queryFactory } from '@/shared/model/query'

export const oneWayMarketNames = queryFactory({
  queryKey: ({ chainId }: ChainParams) => ['chain', { chainId }, 'markets'] as const,
  queryFn: queryOneWayMarketNames,
  staleTime: '5m',
  validationSuite: chainValidationSuite,
})
