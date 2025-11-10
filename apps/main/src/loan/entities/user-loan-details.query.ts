import { cloneDeep } from 'lodash'
import { zeroAddress } from 'viem'
import { invalidateLoanExists } from '@/llamalend/queries/loan-exists'
import { BN } from '@ui/utils'
import { requireLib } from '@ui-kit/features/connect-wallet'
import { queryFactory, rootKeys, type UserMarketParams, type UserMarketQuery } from '@ui-kit/lib/model'
import { userMarketValidationSuite } from '@ui-kit/lib/model/query/user-market-validation'
import type { BandsBalancesData, HealthColorKey } from '../types/loan.types'
import { fulfilledValue } from '../utils/helpers'
import { getChartBandBalancesData, getIsUserCloseToLiquidation, reverseBands, sortBands } from '../utils/utilsCurvejs'

const DEFAULT_USER_LOSS = {
  deposited_collateral: '0',
  current_collateral_estimation: '0',
  loss: '0',
  loss_pct: '0',
}

const DEFAULT_BAND_BALANCES = {
  0: { stablecoin: '0', collateral: '0' },
}

const DEFAULT_USER_STATE = {
  collateral: '0',
  stablecoin: '0',
  debt: '0',
}

export type UserLoanDetails = {
  healthFull: string
  healthNotFull: string
  userBands: number[]
  userBandsRange: number | null
  userBandsPct: string
  userHealth: string
  userPrices: string[]
  userState: { collateral: string; stablecoin: string; debt: string }
  userBandsBalances: BandsBalancesData[]
  userIsCloseToLiquidation: boolean
  userLiquidationBand: number | null
  userLoss: { deposited_collateral: string; current_collateral_estimation: string; loss: string; loss_pct: string }
  userStatus: { label: string; colorKey: HealthColorKey; tooltip: string }
}

function parseUserLoss(userLoss: UserLoanDetails['userLoss']) {
  const smallAmount = 0.00000001
  const resp = cloneDeep(userLoss)
  resp.loss = resp.loss && BN(resp.loss).isLessThan(smallAmount) ? '0' : userLoss.loss
  resp.loss_pct = resp.loss_pct && BN(resp.loss_pct).isLessThan(smallAmount) ? '0' : userLoss.loss_pct

  return resp
}

/** healthNotFull is needed here because:
 * User full health can be > 0
 * But user is at risk of liquidation if not full < 0
 */
function getLiquidationStatus(healthNotFull: string, userIsCloseToLiquidation: boolean, userStateStablecoin: string) {
  const userStatus: { label: string; colorKey: HealthColorKey; tooltip: string } = {
    label: 'Healthy',
    colorKey: 'healthy',
    tooltip: '',
  }

  if (+healthNotFull < 0) {
    userStatus.label = 'Hard liquidatable'
    userStatus.colorKey = 'hard_liquidation'
    userStatus.tooltip =
      'Hard liquidation is like a usual liquidation, which can happen only if you experience significant losses in soft liquidation so that you get below 0 health.'
  } else if (+userStateStablecoin > 0) {
    userStatus.label = 'Soft liquidation'
    userStatus.colorKey = 'soft_liquidation'
    userStatus.tooltip =
      'Soft liquidation is the initial process of collateral being converted into stablecoin, you may experience some degree of loss.'
  } else if (userIsCloseToLiquidation) {
    userStatus.label = 'Close to liquidation'
    userStatus.colorKey = 'close_to_liquidation'
  }

  return userStatus
}

export const {
  useQuery: useUserLoanDetails,
  fetchQuery: fetchUserLoanDetails,
  getQueryData: getUserLoanDetails,
  invalidate: invalidateUserLoanDetails,
} = queryFactory({
  queryKey: (params: UserMarketParams) => [...rootKeys.userMarket(params), 'user-loan-details'] as const,
  queryFn: async ({ marketId, userAddress: rawUserAddress }: UserMarketQuery) => {
    const api = requireLib('llamaApi')
    const market = api.getMintMarket(marketId)

    // Because of the validation suite we can't pass an empty address ('' or undefined),
    // so the caller has to explicitly set it to the zero address instead.
    const userAddress = rawUserAddress === zeroAddress ? '' : rawUserAddress

    const loanExists = await market.loanExists(userAddress)

    const [
      healthFullResult,
      healthNotFullResult,
      userBandsResult,
      userStateResult,
      liquidatingBandResult,
      oraclePriceBandResult,
      userBandsRangeResult,
      userPricesResult,
      userLossResult,
      userBandsBalancesResult,
    ] = await Promise.allSettled([
      loanExists ? market.userHealth(true, userAddress) : Promise.resolve(''),
      loanExists ? market.userHealth(false, userAddress) : Promise.resolve(''),
      loanExists ? market.userBands(userAddress) : Promise.resolve([0, 0]),
      loanExists ? market.userState(userAddress) : Promise.resolve(DEFAULT_USER_STATE),
      loanExists ? market.stats.liquidatingBand() : Promise.resolve(null),
      loanExists ? market.oraclePriceBand() : Promise.resolve(null),
      loanExists ? market.userRange(userAddress) : Promise.resolve(0),
      loanExists ? market.userPrices(userAddress) : Promise.resolve([] as string[]),
      loanExists ? market.userLoss(userAddress) : Promise.resolve(DEFAULT_USER_LOSS),
      loanExists ? market.userBandsBalances(userAddress) : Promise.resolve(DEFAULT_BAND_BALANCES),
    ])

    const healthFull = fulfilledValue(healthFullResult) ?? ''
    const healthNotFull = fulfilledValue(healthNotFullResult) ?? ''
    const userBands = fulfilledValue(userBandsResult) ?? ([0, 0] as [number, number])
    const userState = fulfilledValue(userStateResult) ?? DEFAULT_USER_STATE
    const userLiquidationBand = fulfilledValue(liquidatingBandResult) ?? null
    const oraclePriceBand = fulfilledValue(oraclePriceBandResult) ?? null
    const userBandsRange = fulfilledValue(userBandsRangeResult) ?? null
    const userPrices = fulfilledValue(userPricesResult) ?? ([] as string[])
    const userLoss = fulfilledValue(userLossResult) ?? DEFAULT_USER_LOSS
    const userBandsBalances = fulfilledValue(userBandsBalancesResult) ?? DEFAULT_BAND_BALANCES

    const parsedBandsBalances = await getChartBandBalancesData(
      sortBands(userBandsBalances),
      userLiquidationBand,
      market,
    )
    const reversedUserBands = reverseBands(userBands)
    const userIsCloseToLiquidation = getIsUserCloseToLiquidation(
      reversedUserBands[0],
      userLiquidationBand,
      oraclePriceBand,
    )

    const fetchedUserDetails: UserLoanDetails = {
      healthFull,
      healthNotFull,
      userBands: reversedUserBands,
      userHealth: +healthNotFull < 0 ? healthNotFull : healthFull,
      userIsCloseToLiquidation,
      userState,
      userLiquidationBand,
      userBandsBalances: parsedBandsBalances,
      userBandsRange,
      userBandsPct: userBandsRange ? market.calcRangePct(userBandsRange) : '0',
      userPrices,
      userLoss: parseUserLoss(userLoss),
      userStatus: getLiquidationStatus(healthNotFull, userIsCloseToLiquidation, userState.stablecoin),
    }

    return fetchedUserDetails
  },
  staleTime: '1m',
  validationSuite: userMarketValidationSuite,
})

export const invalidateAllUserBorrowDetails = (params: UserMarketParams) => {
  invalidateLoanExists(params)
  invalidateUserLoanDetails(params)
}
