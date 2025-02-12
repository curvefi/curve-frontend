import { queryFactory } from '@ui-kit/lib/model'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { getChains } from '@curvefi/prices-api/llamalend'
import { getSupportedChains as getSupportedChainsFromApi } from '@curvefi/prices-api/chains'
import { queryClient } from '@ui-kit/lib/api/query-client'

const { getQueryOptions: getSupportedChainOptions } = queryFactory({
  queryKey: () => ['prices-api', 'supported-chains'] as const,
  queryFn: getSupportedChainsFromApi,
  staleTime: '1d',
  validationSuite: EmptyValidationSuite,
})

const { getQueryOptions: getSupportedLendingChainOptions } = queryFactory({
  queryKey: () => ['prices-api', 'supported-lending-chains'] as const,
  queryFn: getChains,
  staleTime: '1d',
  validationSuite: EmptyValidationSuite,
})

export const getSupportedLendingChains = () => queryClient.fetchQuery(getSupportedLendingChainOptions({}))
export const getSupportedChains = () => queryClient.fetchQuery(getSupportedChainOptions({}))
