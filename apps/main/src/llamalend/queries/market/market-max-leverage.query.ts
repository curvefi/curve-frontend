import { group } from 'vest'
import { getMarket, hasLegacyMintLeverage, hasZapV2 } from '@/llamalend/llama.utils'
import { validateRange } from '@/llamalend/queries/validation/borrow-fields.validation'
import type { IChainId } from '@curvefi/api/lib/interfaces'
import { type MarketQuery, rootKeys } from '@evm-ui/lib/model'
import { marketIdValidationSuite } from '@evm-ui/lib/model/query/market-id-validation'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { createValidationSuite } from '@ui/lib/validation/lib'
import { type FieldsOf } from '@ui/lib/validation/types'

type MaxLeverageQuery = MarketQuery<IChainId> & { range: number }
type MaxLeverageParams = FieldsOf<MaxLeverageQuery>

export const { useQuery: useMarketMaxLeverage } = queryFactory({
  queryKey: ({ chainId, marketId, range }: MaxLeverageParams) =>
    [...rootKeys.market({ chainId, marketId }), 'maxLeverage', { range }] as const,
  queryFn: async ({ marketId, range }: MaxLeverageQuery): Promise<Decimal> => {
    const market = getMarket(marketId)
    if (hasZapV2(market)) return (await market.leverageZapV2.maxLeverage(range)) as Decimal
    if (hasLegacyMintLeverage(market)) return (await market.leverage.maxLeverage(range)) as Decimal
    return '0'
  },
  category: 'llamalend.market',
  validationSuite: createValidationSuite(({ chainId, marketId, range }: MaxLeverageParams) => {
    marketIdValidationSuite({ chainId, marketId })
    group('rangeValidationGroup', () => validateRange(range))
  }),
})
