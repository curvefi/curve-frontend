import type { Chain } from '@curvefi/prices-api'
import { getCrvUsdYieldBasisHistory } from '@curvefi/prices-api/yield-basis'
import { EmptyValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { queryFactory } from '@ui-kit/lib/model/query'

type CrvUsdYieldBasisHistoryQuery = {
  chain: Chain
  start?: number
  end?: number
}
type CrvUsdYieldBasisHistoryParams = FieldsOf<CrvUsdYieldBasisHistoryQuery>

export const { useQuery: useCrvUsdYieldBasisHistory } = queryFactory({
  category: 'analytics.chart',
  queryKey: ({ chain, start, end }: CrvUsdYieldBasisHistoryParams) =>
    ['crvusd-yield-basis-history', { chain }, { start }, { end }] as const,
  queryFn: ({ chain, start, end }: CrvUsdYieldBasisHistoryQuery) => getCrvUsdYieldBasisHistory(chain, { start, end }),
  validationSuite: EmptyValidationSuite,
  keepPreviousData: true,
})
