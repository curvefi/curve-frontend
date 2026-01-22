import { invalidateUserMarketBalances } from '@/lend/entities/user-market-balances'
import { fetchChartBandBalancesData } from '@/lend/lib/apiLending'
import { UserLoss, ParsedBandsBalances, ChainId } from '@/lend/types/lend.types'
import { getIsUserCloseToLiquidation, getLiquidationStatus, reverseBands, sortBandsLend } from '@/llamalend/llama.utils'
import type { HealthColorKey } from '@/llamalend/llamalend.types'
import { invalidateUserPrices } from '@/llamalend/queries/user-prices.query'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory } from '@ui-kit/lib/model/query'
import { rootKeys } from '@ui-kit/lib/model/query/root-keys'
import type { UserMarketQuery, UserMarketParams } from '@ui-kit/lib/model/query/root-keys'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'

type UserLoanDetailsQuery = UserMarketQuery<ChainId>
type UserLoanDetailsParams = UserMarketParams<ChainId>

type UserLoanDetails = {
  health: string
  healthFull: string
  healthNotFull: string
  bands: number[]
  bandsBalances: ParsedBandsBalances[]
  bandsPct: string
  isCloseToLiquidation: boolean
  loss?: UserLoss
  prices: string[]
  range: number | null
  state: { collateral: string; borrowed: string; debt: string; N: string }
  status: { label: string; colorKey: HealthColorKey; tooltip: string }
  leverage: string
  pnl: Record<string, string> // todo: pnl data is unused for now
}

const _getUserLoanDetails = async ({ marketId, userAddress }: UserLoanDetailsQuery): Promise<UserLoanDetails> => {
  const api = requireLib('llamaApi')
  const market = api.getLendMarket(marketId)

  const [state, healthFull, healthNotFull, range, bands, prices, bandsBalances, oraclePriceBand, leverage, pnl] =
    await Promise.all([
      market.userState(),
      market.userHealth(),
      market.userHealth(false),
      market.userRange(),
      market.userBands(),
      market.userPrices(),
      market.userBandsBalances(),
      market.oraclePriceBand(),
      market.currentLeverage(userAddress),
      market.currentPnL(userAddress),
    ])

  let loss: UserLoss | undefined
  try {
    loss = await market.userLoss()
  } catch (error) {
    console.error('Failed to fetch user loss:', error)
  }

  const resp = await market.stats.bandsInfo()
  const { liquidationBand } = resp ?? {}

  const reversedUserBands = reverseBands(bands)
  const isCloseToLiquidation = getIsUserCloseToLiquidation(reversedUserBands[0], liquidationBand, oraclePriceBand)
  const parsedBandsBalances = await fetchChartBandBalancesData(
    sortBandsLend(bandsBalances),
    liquidationBand,
    market,
    false,
  )

  return {
    state,
    health: +healthNotFull < 0 ? healthNotFull : healthFull,
    healthFull,
    healthNotFull,
    bands: reversedUserBands,
    bandsBalances: parsedBandsBalances,
    bandsPct: range ? await market.calcRangePct(range) : '0',
    isCloseToLiquidation,
    range,
    prices,
    loss,
    leverage,
    status: getLiquidationStatus(healthNotFull, isCloseToLiquidation, state.borrowed),
    pnl,
  }
}

export const { useQuery: useUserLoanDetails, invalidate: invalidateUserLoanDetails } = queryFactory({
  queryKey: (params: UserLoanDetailsParams) => [...rootKeys.userMarket(params), 'userLoanDetails', 'v1'] as const,
  queryFn: _getUserLoanDetails,
  refetchInterval: '1m',
  validationSuite: userMarketValidationSuite,
})

export const invalidateAllUserBorrowDetails = (params: UserLoanDetailsParams) => {
  invalidateUserMarketBalances(params)
  invalidateUserLoanDetails(params)
  invalidateUserPrices(params)
}
