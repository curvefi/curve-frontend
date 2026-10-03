import { getMarket } from '@/llamalend/llama.utils'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import type { UserMarketParams, UserMarketQuery } from '@evm-ui/queries/query-types'
import { userMarketValidationSuite } from '@evm-ui/queries/validation/user-market-validation'
import { queryFactory } from '@ui/features/queries/factory'

export const { useQuery: useLoanExists } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: UserMarketParams) => ({
    name: 'loanExists',
    chainId,
    marketId,
    userAddress,
  }),
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) => {
    const market = getMarket(marketId)
    return market instanceof MintMarketTemplate
      ? market.loanExists(userAddress)
      : market.userPosition.userLoanExists(userAddress)
  },
  category: 'llamalend.user',
  validationSuite: userMarketValidationSuite,
})
