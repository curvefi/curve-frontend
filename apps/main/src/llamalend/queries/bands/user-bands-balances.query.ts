import { getLlamaMarket } from '@/llamalend/llama.utils'
import { fetchChartBandBalancesData, sortBands } from '@/llamalend/queries/bands/bands-balances.query-helpers'
import { getUserPositionImplementation, normalizeBands } from '@/llamalend/queries/market/market.query-helpers'
import { liquidationBandValidationGroup } from '@/llamalend/queries/validation/bands-validation'
import type { UserMarketQuery } from '@ui-kit/lib/model'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { loanExistsValidationGroup } from '@ui-kit/lib/model/query/loan-exists-validation'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'
import { createValidationSuite, FieldsOf } from '@ui-kit/lib/validation'

const isMarket = false
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
    const market = getLlamaMarket(marketId)
    const userBandsBalances = normalizeBands(await getUserPositionImplementation(market).userBandsBalances(userAddress))
    return fetchChartBandBalancesData(sortBands(userBandsBalances), liquidationBand, market, isMarket)
  },
  category: 'llamalend.user',
  validationSuite: userBandsBalancesValidationSuite,
})
