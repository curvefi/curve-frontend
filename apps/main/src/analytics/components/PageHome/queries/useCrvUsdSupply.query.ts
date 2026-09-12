import { getCrvUsdSupply } from '@curvefi/prices-api/crvusd'
import { queryFactory } from '@ui/features/queries/factory'
import { EmptyValidationSuite } from '@ui/lib/validation/lib'
import { type FieldsOf } from '@ui/lib/validation/types'

type CrvUsdSupplyQuery = { days: number }
type CrvUsdSupplyParams = FieldsOf<CrvUsdSupplyQuery>

export const { useQuery: useCrvUsdSupply } = queryFactory({
  category: 'analytics.chart',
  queryKey: ({ days }: CrvUsdSupplyParams) => ['crvusd-supply', { days }] as const,
  queryFn: ({ days }: CrvUsdSupplyQuery) => getCrvUsdSupply('ethereum', days),
  validationSuite: EmptyValidationSuite,
  keepPreviousData: true,
})
