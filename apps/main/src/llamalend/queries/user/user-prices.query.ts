import { useMarketOraclePrice } from '@/llamalend/queries/market'
import { getUserPositionImplementation } from '@/llamalend/queries/market/market.query-helpers'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueryState, type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys, type UserMarketParams, type UserMarketQuery } from '@ui-kit/lib/model'
import { loanExistsValidationGroup } from '@ui-kit/lib/model/query/loan-exists-validation'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { q, type Range } from '@ui-kit/types/util'
import { useLoanExists } from './user-loan-exists.query'

type UserPricesQuery = UserMarketQuery & { loanExists: boolean }
type UserPricesParams = FieldsOf<UserPricesQuery>

const { useQuery: useUserPricesQuery } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, loanExists }: UserPricesParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'userPrices', { loanExists }] as const,
  queryFn: async ({ marketId, userAddress }: UserPricesQuery): Promise<Range<Decimal>> =>
    (await getUserPositionImplementation(marketId).userPrices(userAddress)) as Range<Decimal>,
  category: 'llamalend.user',
  validationSuite: createValidationSuite((params: UserPricesParams) => {
    marketIdValidationSuite(params)
    loanExistsValidationGroup(params)
  }),
})

export const useUserPrices = (params: UserMarketParams, enabled?: boolean) => {
  const loan = useLoanExists(params, enabled)
  const prices = useUserPricesQuery({ ...params, loanExists: loan.data }, enabled)
  return { ...q(prices), ...combineQueryState(loan, prices) }
}

export function useRangeToLiquidation({ params }: { params: UserMarketParams }) {
  const userPrices = useUserPrices(params)
  const oraclePrice = useMarketOraclePrice(params)
  const rangeToLiquidation = {
    data:
      oraclePrice.data && userPrices.data && ((+oraclePrice.data - +userPrices.data[1]) / +userPrices.data[1]) * 100,
    ...combineQueryState(userPrices, oraclePrice),
  }
  return { rangeToLiquidation, userPrices }
}
