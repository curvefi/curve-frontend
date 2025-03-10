import { getSupportedChains as getSupportedChainsFromApi } from '@curvefi/prices-api/chains'
import { getChains } from '@curvefi/prices-api/llamalend'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryClient } from '@ui-kit/lib/api/query-client'
import { queryFactory } from '@ui-kit/lib/model'

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
