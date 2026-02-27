import { getLlamaMarket } from '@/llamalend/llama.utils'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { queryFactory, rootKeys, type UserMarketParams, type UserMarketQuery } from '@ui-kit/lib/model'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'

export const {
  useQuery: useLoanExists,
  refetchQuery: refetchLoanExists,
  getQueryData: getLoanExists,
  invalidate: invalidateLoanExists,
} = queryFactory({
  queryKey: (params: UserMarketParams) => [...rootKeys.userMarket(params), 'market-user-loan-exists'] as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) => {
    const market = getLlamaMarket(marketId)
    return market instanceof MintMarketTemplate ? market.loanExists(userAddress) : market.userLoanExists(userAddress)
  },
  category: 'user',
  validationSuite: userMarketValidationSuite,
})
