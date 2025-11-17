import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { type FieldsOf } from '@ui-kit/lib'
import type { PoolQuery } from '@ui-kit/lib/model'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'
import { decimal, Decimal } from '@ui-kit/utils'

type MarketRateQuery = PoolQuery<IChainId>
type MarketRateParams = FieldsOf<MarketRateQuery>

export type BorrowRatesResult = {
  borrowApr: Decimal
  borrowApy?: Decimal
  lendApr?: Decimal
  lendApy?: Decimal
}

const convertRates = ({
  borrowApr,
  borrowApy,
  lendApr,
  lendApy,
}: { [K in keyof BorrowRatesResult]: string }): BorrowRatesResult => ({
  borrowApr: decimal(borrowApr)!,
  borrowApy: decimal(borrowApy),
  lendApy: decimal(lendApy),
  lendApr: decimal(lendApr),
})

const [isGetter, useAPI] = [true, true] as const

export const { useQuery: useMarketRates } = queryFactory({
  queryKey: ({ chainId, poolId }: MarketRateParams) => [...rootKeys.pool({ chainId, poolId }), 'market-rates'] as const,
  queryFn: async ({ poolId }: MarketRateQuery) => {
    const market = getLlamaMarket(poolId)
    return convertRates(
      market instanceof LendMarketTemplate
        ? await market.stats.rates(isGetter, useAPI)
        : { borrowApr: (await market.stats.parameters()).rate },
    )
  },
  validationSuite: llamaApiValidationSuite,
})
