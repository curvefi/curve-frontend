import { queryFactory } from '@ui-kit/lib/model'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { getChains } from '@curvefi/prices-api/src/llamalend'
import { getSupportedChains } from '@curvefi/prices-api/src/chains'

export const { fetchQuery: fetchSupportedChains } = queryFactory({
  queryKey: () => ['prices-api', 'supported-chains'] as const,
  queryFn: getSupportedChains,
  staleTime: '1d',
  validationSuite: EmptyValidationSuite,
})

export const { fetchQuery: fetchSupportedLendingChains } = queryFactory({
  queryKey: () => ['prices-api', 'supported-lending-chains'] as const,
  queryFn: getChains,
  staleTime: '1d',
  validationSuite: EmptyValidationSuite,
})
