import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { type FieldsOf } from '@ui-kit/lib'
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
    (await getLlamaMarket(marketId).userPrices(userAddress)) as Range<Decimal>,
  category: 'llamalend.user',
  validationSuite: createValidationSuite((params: UserPricesParams) => {
    marketIdValidationSuite(params)
    loanExistsValidationGroup(params)
  }),
})

export const useUserPrices = (params: UserMarketParams) => {
  const { data: loanExists, isLoading: isLoanExistsLoading, error: loanExistsError } = useLoanExists(params)
  const queryResult = useUserPricesQuery({ ...params, loanExists })

  return {
    ...q(queryResult),
    isLoading: isLoanExistsLoading || queryResult.isLoading,
    error: loanExistsError || queryResult.error,
  }
}
