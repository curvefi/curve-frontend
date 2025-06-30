import { getSupportedChains as getSupportedChainsFromApi } from '@curvefi/prices-api/chains'
import { getChains } from '@curvefi/prices-api/llamalend'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model'

export const { fetchQuery: fetchSupportedChains, setQueryData: setSupportedChains } = queryFactory({
  queryKey: () => ['prices-api', 'supported-chains'] as const,
  queryFn: getSupportedChainsFromApi,
  staleTime: '1d',
  validationSuite: EmptyValidationSuite,
})

export const { fetchQuery: fetchSupportedLendingChains, setQueryData: setSupportedLendingChains } = queryFactory({
  queryKey: () => ['prices-api', 'supported-lending-chains'] as const,
  queryFn: getChains,
  staleTime: '1d',
  validationSuite: EmptyValidationSuite,
})
