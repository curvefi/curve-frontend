import { group } from '@ui-kit/lib/validation/lib'
import { validateDebt } from '@/llamalend/features/borrow/queries/borrow.validation'
import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { type PoolQuery } from '@ui-kit/lib/model'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { poolValidationGroup } from '@ui-kit/lib/model/query/pool-validation'
import type { CompleteBorrowForm } from '../types'

type BorrowApyQuery = PoolQuery<IChainId> & Pick<CompleteBorrowForm, 'debt'>
type BorrowFutureApyParams = FieldsOf<BorrowApyQuery>

export type BorrowFutureRatesResult = {
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
}: { [K in keyof BorrowFutureRatesResult]: string }): BorrowFutureRatesResult => ({
  borrowApr: +borrowApr,
  ...(borrowApy && { borrowApy: +borrowApy }),
  ...(lendApy && { lendApy: +lendApy }),
  ...(lendApr && { lendApr: +lendApr }),
})

const reserves = 0 as const

export const { useQuery: useMarketFutureRates } = queryFactory({
  queryKey: ({ chainId, poolId, debt }: BorrowFutureApyParams) =>
    [...rootKeys.pool({ chainId, poolId }), 'market-future-rates', { debt }] as const,
  queryFn: async ({ poolId, debt }: BorrowApyQuery) => {
    const market = getLlamaMarket(poolId)
    return market instanceof LendMarketTemplate
      ? convertRates(await market.stats.futureRates(reserves, debt))
      : convertRates({ borrowApr: (await market.stats.parameters()).future_rate })
  },
  validationSuite: createValidationSuite(({ chainId, poolId, debt }: BorrowFutureApyParams) => {
    poolValidationGroup({ chainId, poolId })
    llamaApiValidationGroup({ chainId })
    group('borrowFormValidationGroup', () => {
      validateDebt(debt)
    })
  }),
})
