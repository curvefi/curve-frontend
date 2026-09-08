import { getMarket } from '@/llamalend/llama.utils'
import { fetchChartBandBalancesData, sortBands } from '@/llamalend/queries/bands/bands-balances.query-helpers'
import { getUserPositionImplementation, normalizeBands } from '@/llamalend/queries/market/market.query-helpers'
import { liquidationBandValidationGroup } from '@/llamalend/queries/validation/bands-validation'
import type { UserMarketQuery } from '@evm-ui/lib/model'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import { loanExistsValidationGroup } from '@evm-ui/lib/model/query/loan-exists-validation'
import { userMarketValidationSuite } from '@evm-ui/lib/model/query/user-market-validation'
import { createValidationSuite, FieldsOf } from '@evm-ui/lib/validation'

const IS_MARKET = false
const QUERY_KEY = 'userBandsBalances' as const

type UserBandsBalancesQuery = UserMarketQuery & {
  loanExists: boolean
  liquidationBand: number
}
type UserBandsBalancesParams = FieldsOf<UserBandsBalancesQuery>

const userBandsBalancesValidationSuite = createValidationSuite((params: UserBandsBalancesParams) => {
  userMarketValidationSuite(params)
  loanExistsValidationGroup(params)
  liquidationBandValidationGroup(params)
})

export const { useQuery: useUserBandsBalances } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, loanExists, liquidationBand }: UserBandsBalancesParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      QUERY_KEY,
      { loanExists },
      { liquidationBand },
    ] as const,
  queryFn: async ({ marketId, userAddress, liquidationBand }: UserBandsBalancesQuery) => {
    const market = getMarket(marketId)
    const userBandsBalances = normalizeBands(await getUserPositionImplementation(market).userBandsBalances(userAddress))
    return fetchChartBandBalancesData(sortBands(userBandsBalances), liquidationBand, market, IS_MARKET)
  },
  category: 'llamalend.user',
  validationSuite: userBandsBalancesValidationSuite,
})
