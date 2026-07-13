import { getSupportedChains } from '@curvefi/prices-api/chains'
import { EmptyValidationSuite } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model'

export const { useQuery: usePricesNetworks } = queryFactory({
  queryKey: () => ['prices', 'networks'] as const,
  queryFn: getSupportedChains,
  validationSuite: EmptyValidationSuite, // no args
  category: 'global.networks',
})
