import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys, type UserMarketParams, type UserMarketQuery } from '@ui-kit/lib/model'
import { loanExistsValidationGroup } from '@ui-kit/lib/model/query/loan-exists-validation'
import { marketIdValidationSuite } from '@ui-kit/lib/model/query/market-id-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { q } from '@ui-kit/types/util'
import { useLoanExists } from './user-loan-exists.query'

type UserPricesQuery = UserMarketQuery & { loanExists: boolean }
type UserPricesParams = FieldsOf<UserPricesQuery>

const { useQuery: useUserPricesQuery, invalidate: invalidateUserPrices } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, loanExists }: UserPricesParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'userPrices', { loanExists }] as const,
  queryFn: async ({ marketId, userAddress }: UserPricesQuery): Promise<string[]> => {
    const market = getLlamaMarket(marketId)

    if (market instanceof LendMarketTemplate) {
      return await market.userPrices()
    } else {
      return await market.userPrices(userAddress)
    }
  },
  refetchInterval: '1m',
  validationSuite: createValidationSuite((params: UserPricesParams) => {
    marketIdValidationSuite(params)
    loanExistsValidationGroup(params)
  }),
})

export { invalidateUserPrices }

export const useUserPrices = (params: UserMarketParams) => {
  const { data: loanExists, isLoading: isLoanExistsLoading, error: loanExistsError } = useLoanExists(params)
  const queryResult = useUserPricesQuery({ ...params, loanExists })

  return {
    ...q(queryResult),
    isLoading: isLoanExistsLoading || queryResult.isLoading,
    error: loanExistsError || queryResult.error,
  }
}
