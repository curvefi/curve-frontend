import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { type FieldsOf } from '@ui-kit/lib'
import type { PoolQuery } from '@ui-kit/lib/model'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'

type BorrowApyQuery = PoolQuery<IChainId>
type BorrowApyParams = FieldsOf<BorrowApyQuery>

export type BorrowRatesResult = {
  borrowApr: number
  borrowApy?: number
  lendApr?: number
  lendApy?: number
}

const convertRates = ({
  borrowApr,
  borrowApy,
  lendApr,
  lendApy,
}: { [K in keyof BorrowRatesResult]: string }): BorrowRatesResult => ({
  borrowApr: +borrowApr,
  ...(borrowApy && { borrowApy: +borrowApy }),
  ...(lendApy && { lendApy: +lendApy }),
  ...(lendApr && { lendApr: +lendApr }),
})

const [isGetter, useAPI] = [true, true] as const

export const { useQuery: useMarketRates } = queryFactory({
  queryKey: ({ chainId, poolId }: BorrowApyParams) => [...rootKeys.pool({ chainId, poolId }), 'market-rates'] as const,
  queryFn: async ({ poolId }: BorrowApyQuery) => {
    const market = getLlamaMarket(poolId)
    return market instanceof LendMarketTemplate
      ? convertRates(await market.stats.rates(isGetter, useAPI))
      : convertRates({ borrowApr: (await market.stats.parameters()).rate })
  },
  validationSuite: llamaApiValidationSuite,
})
