import { group } from 'vest'
import { getLlamaMarket, hasLeverage } from '@/llamalend/llama.utils'
import { validateRange } from '@/llamalend/queries/validation/borrow-fields.validation'
import type { IChainId } from '@curvefi/api/lib/interfaces'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { type MarketQuery, queryFactory, rootKeys } from '@ui-kit/lib/model'
import { chainValidationGroup } from '@ui-kit/lib/model/query/chain-validation'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { Decimal } from '@ui-kit/utils'

type MaxLeverageQuery = MarketQuery<IChainId> & { range: number }
type MaxLeverageParams = FieldsOf<MaxLeverageQuery>

export const { useQuery: useMarketMaxLeverage } = queryFactory({
  queryKey: ({ chainId, marketId, range }: MaxLeverageParams) =>
    [...rootKeys.market({ chainId, marketId }), 'maxLeverage', { range }] as const,
  queryFn: async ({ marketId, range }: MaxLeverageQuery): Promise<Decimal> => {
    const market = getLlamaMarket(marketId)
    return hasLeverage(market)
      ? market instanceof MintMarketTemplate && market.leverageV2.hasLeverage()
        ? ((await market.leverageV2.maxLeverage(range)) as Decimal)
        : ((await market.leverage.maxLeverage(range)) as Decimal)
      : '0'
  },
  staleTime: '1m',
  validationSuite: createValidationSuite(({ chainId, range }: MaxLeverageParams) => {
    chainValidationGroup({ chainId })
    llamaApiValidationGroup({ chainId })
    group('rangeValidationGroup', () => validateRange(range))
  }),
})
