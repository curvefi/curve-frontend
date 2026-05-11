import type { Chain } from '@curvefi/prices-api'
import { getCrvUsdYieldBasisSupply } from '@curvefi/prices-api/yield-basis'
import { EmptyValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'

type CrvUsdYieldBasisSupplyQuery = { chain: Chain }
type CrvUsdYieldBasisSupplyParams = FieldsOf<CrvUsdYieldBasisSupplyQuery>

export const { useQuery: useCrvUsdYieldBasisSupply } = queryFactory({
  category: 'analytics.chart',
  queryKey: ({ chain }: CrvUsdYieldBasisSupplyParams) => ['crvusd-yield-basis-supply', { chain }] as const,
  queryFn: ({ chain }: CrvUsdYieldBasisSupplyQuery) => getCrvUsdYieldBasisSupply(chain),
  validationSuite: EmptyValidationSuite,
})
