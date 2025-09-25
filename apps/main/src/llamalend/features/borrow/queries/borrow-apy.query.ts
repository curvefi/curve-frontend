import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { type FieldsOf } from '@ui-kit/lib'
import type { PoolQuery } from '@ui-kit/lib/model'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'
import { type PreciseNumber, toPrecise } from '@ui-kit/utils'
import { maxBorrowReceiveKey } from './borrow-max-receive.query'

type BorrowApyQuery = PoolQuery<IChainId>
type BorrowApyParams = FieldsOf<BorrowApyQuery>

export type BorrowRatesResult = {
  borrowApr: PreciseNumber
  borrowApy?: PreciseNumber
  lendApr?: PreciseNumber
  lendApy?: PreciseNumber
}

const convertRates = ({
  borrowApr,
  borrowApy,
  lendApr,
  lendApy,
}: { [K in keyof BorrowRatesResult]: string }): BorrowRatesResult => ({
  borrowApr: toPrecise(borrowApr),
  ...(borrowApy && { borrowApy: toPrecise(borrowApy) }),
  ...(lendApy && { lendApy: toPrecise(lendApy) }),
  ...(lendApr && { lendApr: toPrecise(lendApr) }),
})

export const { useQuery: useMarketRates } = queryFactory({
  queryKey: ({ chainId, poolId }: BorrowApyParams) => [...rootKeys.pool({ chainId, poolId }), 'market-rates'] as const,
  queryFn: async ({ poolId }: BorrowApyQuery) => {
    const market = getLlamaMarket(poolId)
    return market instanceof LendMarketTemplate
      ? convertRates(await market.stats.rates())
      : convertRates({ borrowApr: (await market.stats.parameters()).rate })
  },
  validationSuite: llamaApiValidationSuite,
  dependencies: (params) => [maxBorrowReceiveKey(params)],
})
