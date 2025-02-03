import { queryFactory } from '@ui-kit/lib/model'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { getChains } from '@curvefi/prices-api/llamalend'
import { getSupportedChains } from '@curvefi/prices-api/chains'

export const { getQueryOptions: getSupportedChainOptions } = queryFactory({
  queryKey: () => ['prices-api', 'supported-chains'] as const,
  queryFn: getSupportedChains,
  staleTime: '1d',
  validationSuite: EmptyValidationSuite,
})

export const { getQueryOptions: getSupportedLendingChainOptions } = queryFactory({
  queryKey: () => ['prices-api', 'supported-lending-chains'] as const,
  queryFn: getChains,
  staleTime: '1d',
  validationSuite: EmptyValidationSuite,
})
