import { getSupportedChains } from '@curvefi/prices-api/chains'
import { getChains } from '@curvefi/prices-api/llamalend'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model'

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
