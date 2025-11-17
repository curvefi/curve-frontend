import { group } from 'vest'
import { getLlamaMarket } from '@/llamalend/llama.utils'
import { validateDebt } from '@/llamalend/queries/validation/borrow-fields.validation'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { createValidationSuite, type FieldsOf } from '@ui-kit/lib'
import { type PoolQuery } from '@ui-kit/lib/model'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { llamaApiValidationGroup } from '@ui-kit/lib/model/query/curve-api-validation'
import { poolValidationGroup } from '@ui-kit/lib/model/query/pool-validation'
import { decimal, type Decimal } from '@ui-kit/utils'

type BorrowApyQuery = PoolQuery<IChainId> & { debt: Decimal }
type BorrowFutureApyParams = FieldsOf<BorrowApyQuery>

export type BorrowFutureRatesResult = {
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
}: { [K in keyof BorrowFutureRatesResult]: string }): BorrowFutureRatesResult => ({
  borrowApr: decimal(borrowApr)!,
  borrowApy: decimal(borrowApy),
  lendApy: decimal(lendApy),
  lendApr: decimal(lendApr),
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
