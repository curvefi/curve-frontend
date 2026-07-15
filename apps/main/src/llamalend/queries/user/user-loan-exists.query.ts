import { identity } from 'lodash'
import { getMarket } from '@/llamalend/llama.utils'
import { MarketTemplate } from '@/llamalend/llamalend.types'
import { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import { combineQueries } from '@ui-kit/lib'
import { queryFactory, rootKeys, type UserMarketParams, type UserMarketQuery } from '@ui-kit/lib/model'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'
import { QueryProp } from '@ui-kit/types/util'

export const { useQuery: useLoanExists } = queryFactory({
  queryKey: (params: UserMarketParams) => [...rootKeys.userMarket(params), 'loanExists'] as const,
  queryFn: async ({ marketId, userAddress }: UserMarketQuery) => {
    const market = getMarket(marketId)
    return market instanceof MintMarketTemplate
      ? market.loanExists(userAddress)
      : market.userPosition.userLoanExists(userAddress)
  },
  category: 'llamalend.user',
  validationSuite: userMarketValidationSuite,
})

export const useHasLoan = ({
  chainId,
  marketId,
  marketQuery,
  userAddress,
}: UserMarketParams & {
  marketQuery: QueryProp<MarketTemplate>
}) =>
  // todo: it's much simpler to add 'dependencies' to `useLoanExists` but that hook cannot access the loading code in the separate apps
  combineQueries(
    [
      useLoanExists(
        { chainId, marketId, userAddress },
        !!marketQuery.data, // enable query as soon as market is defined, the validation suite isn't able to detect it otherwise
      ),
      marketQuery, // combine with market query to inherit error/loading state
    ],
    identity, // take only the exists result, we don't care about the market in this query
  )
