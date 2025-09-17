import { group } from 'vest'
import { getLlamaMarket, hasLeverage } from '@/llamalend/llama.utils'
import type { IChainId } from '@curvefi/api/lib/interfaces'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { type PoolQuery, queryFactory, rootKeys } from '@ui-kit/lib/model'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { validateRange } from './borrow.validation'

type BorrowMaxLeverageQuery = PoolQuery<IChainId> & { range: number }
type BorrowMaxLeverageParams = FieldsOf<BorrowMaxLeverageQuery>

export const { useQuery: useMaxLeverage } = queryFactory({
  queryKey: ({ chainId, poolId, range }: BorrowMaxLeverageParams) =>
    [...rootKeys.pool({ chainId, poolId }), 'maxLeverage', { range }] as const,
  queryFn: async ({ poolId, range }: BorrowMaxLeverageQuery): Promise<number> => {
    const market = getLlamaMarket(poolId)
    return hasLeverage(market)
      ? market instanceof MintMarketTemplate && market.leverageV2.hasLeverage()
        ? +(await market.leverageV2.maxLeverage(range))
        : +(await market.leverage.maxLeverage(range))
      : 0
  },
  staleTime: '1m',
  validationSuite: createValidationSuite(({ chainId, range }: BorrowMaxLeverageParams) => {
    chainValidationGroup({ chainId })
    llamaApiValidationGroup({ chainId })
    group('rangeValidationGroup', () => validateRange(range))
  }),
})
