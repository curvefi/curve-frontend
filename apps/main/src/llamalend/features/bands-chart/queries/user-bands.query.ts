import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import type { UserMarketQuery, UserMarketParams } from '@ui-kit/lib/model'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { loanExistsValidationGroup } from '@ui-kit/lib/model/query/loan-exists-validation'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'
import { createValidationSuite } from '@ui-kit/lib/validation'
import { sortLendBands, sortMintBands, fetchLendChartBandBalancesData, fetchMintChartBandBalancesData } from './utils'

type UserBandsQuery = UserMarketQuery & { loanExists: boolean | undefined | null }
type UserBandsParams = UserMarketParams & { loanExists: boolean | undefined | null }

const userBandsValidationSuite = createValidationSuite((params: UserBandsParams) => {
  userMarketValidationSuite(params)
  loanExistsValidationGroup({ loanExists: params.loanExists })
})

export const { useQuery: useUserBands } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress }: UserBandsParams) =>
    [...rootKeys.userMarket({ chainId, marketId, userAddress }), 'user-bands'] as const,
  queryFn: async ({ marketId, userAddress }: UserBandsQuery) => {
    const market = getLlamaMarket(marketId)
    if (market instanceof LendMarketTemplate) {
      const [userBandsBalances, bandInfo] = await Promise.all([
        market.userBandsBalances(userAddress),
        market.stats.bandsInfo(),
      ])
      const { liquidationBand } = bandInfo
      return fetchLendChartBandBalancesData(sortLendBands(userBandsBalances), liquidationBand, market, false)
    } else {
      const [userBandsBalances, liquidationBand] = await Promise.all([
        market.userBandsBalances(userAddress),
        market.stats.liquidatingBand(),
      ])
      return fetchMintChartBandBalancesData(sortMintBands(userBandsBalances), liquidationBand, market)
    }
  },
  validationSuite: userBandsValidationSuite,
})
