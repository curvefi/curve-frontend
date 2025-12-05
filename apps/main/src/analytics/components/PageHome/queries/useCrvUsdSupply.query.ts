import { getCrvUsdSupply } from '@curvefi/prices-api/crvusd'
import { EmptyValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'

type CrvUsdSupplyQuery = { days: number }
type CrvUsdSupplyParams = FieldsOf<CrvUsdSupplyQuery>

/** Query factory for fetching crvUSD supply data */
export const { useQuery: useCrvUsdSupply } = queryFactory({
  queryKey: ({ days }: CrvUsdSupplyParams) => ['crvusd-supply', { days }] as const,
  queryFn: ({ days }: CrvUsdSupplyQuery) => getCrvUsdSupply('ethereum', days),
  validationSuite: EmptyValidationSuite,
})
