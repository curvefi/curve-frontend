import { useMarketOraclePrice } from '@/llamalend/queries/market'
import { getUserPositionImplementation } from '@/llamalend/queries/market/market.query-helpers'
import type { Decimal } from '@primitives/decimal.utils'
import { combineQueryState, type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys, type UserMarketParams, type UserMarketQuery } from '@ui-kit/lib/model'
import { loanExistsValidationGroup } from '@ui-kit/lib/model/query/loan-exists-validation'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { constQ, q, type Range } from '@ui-kit/types/util'
import { decimalDiv, decimalMinus, decimalMultiply } from '@ui-kit/utils'
import { useLoanExists } from './user-loan-exists.query'

type UserPricesQuery = UserMarketQuery & { loanExists: boolean }
type UserPricesParams = FieldsOf<UserPricesQuery>

const calculatePriceDropToLiquidationThreshold = (currentPrice: Decimal, [, liquidationThreshold]: Range<Decimal>) =>
  decimalMultiply(decimalDiv(decimalMinus(currentPrice, liquidationThreshold), currentPrice), `100`)

const { useQuery: useUserPricesQuery, queryKey: getUserPricesKey } = queryFactory({
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
  return { ...(loan.data === false ? constQ(null) : q(prices)), ...combineQueryState(loan, prices) }
}

export function useRangeToLiquidation({ params }: { params: UserMarketParams }) {
  const userPrices = useUserPrices(params)
  const oraclePrice = useMarketOraclePrice(params)
  const rangeToLiquidation = {
    data:
      oraclePrice.data &&
      userPrices.data &&
      calculatePriceDropToLiquidationThreshold(oraclePrice.data, userPrices.data),
    ...combineQueryState(userPrices, oraclePrice),
  }
  return { rangeToLiquidation, userPrices }
}

export { getUserPricesKey }
