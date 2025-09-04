import { group } from 'vest'
import { validateRange } from '@/llamalend/widgets/borrow/queries/borrow.validation'
import type { IChainId } from '@curvefi/api/lib/interfaces'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { type PoolQuery, queryFactory, rootKeys } from '@ui-kit/lib/model'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { LlamaMarketType } from '@ui-kit/types/market'
import { hasLeverage } from '../borrow.util'
import { getLlamaMarket } from '../llama.util'

type BorrowMaxLeverageQuery = PoolQuery<IChainId> & { range: number }
type BorrowMaxLeverageParams = FieldsOf<BorrowMaxLeverageQuery>

export const { useQuery: useMaxBorrowLeverage } = queryFactory({
  queryKey: ({ chainId, poolId, range }: BorrowMaxLeverageParams) =>
    [...rootKeys.pool({ chainId, poolId }), 'max-borrow-leverage-v1', { range }] as const,
  queryFn: async ({ poolId, range }: BorrowMaxLeverageQuery): Promise<number> => {
    const [market, type] = getLlamaMarket(poolId)
    return type === LlamaMarketType.Lend
      ? market.leverage.hasLeverage()
        ? +(await market.leverage.maxLeverage(range))
        : 0
      : market.leverageV2.hasLeverage()
        ? +(await market.leverageV2.maxLeverage(range))
        : hasLeverage(market)
          ? +(await market.leverage.maxLeverage(range))
          : 0
  },
  staleTime: '1m',
  validationSuite: createValidationSuite(({ chainId, range }: BorrowMaxLeverageParams) => {
    chainValidationGroup({ chainId })
    llamaApiValidationGroup({ chainId })
    group('rangeValidationGroup', () => {
      validateRange(range)
    })
  }),
})
