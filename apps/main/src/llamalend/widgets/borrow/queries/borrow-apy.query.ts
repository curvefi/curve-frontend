import { maxBorrowReceiveKey } from '@/llamalend/widgets/borrow/queries/borrow-max-receive.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type FieldsOf } from '@ui-kit/lib'
import type { PoolQuery } from '@ui-kit/lib/model'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { llamaApiValidationSuite } from '@ui-kit/lib/model/query/curve-api-validation'
import { LlamaMarketType } from '@ui-kit/types/market'
import { getLlamaMarket } from '../llama.util'

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
  ...(lendApr && { borrowApr: +lendApr }),
})

export const { useQuery: useMarketRates } = queryFactory({
  queryKey: ({ chainId, poolId }: BorrowApyParams) => [...rootKeys.pool({ chainId, poolId }), 'market-rates'] as const,
  queryFn: async ({ poolId }: BorrowApyQuery) => {
    const [market, type] = getLlamaMarket(poolId)
    return type === LlamaMarketType.Lend
      ? convertRates(await market.stats.rates())
      : convertRates({ borrowApr: (await market.stats.parameters()).rate })
  },
  validationSuite: llamaApiValidationSuite,
  dependencies: (params) => [maxBorrowReceiveKey(params)],
})
