import {
  repayFromCollateralIsFullValidationSuite,
  repayFromCollateralValidationSuite,
} from '@/llamalend/features/manage-loan/queries/manage-loan.validation'
import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { Decimal } from '@ui-kit/utils'
import {
  RepayFromCollateralHealthQuery,
  RepayFromCollateralParams,
  type RepayFromCollateralQuery,
} from './manage-loan.types'

export const { useQuery: useRepayFromCollateralBands } = queryFactory({
  queryKey: ({
    chainId,
    poolId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
  }: RepayFromCollateralParams) =>
    [
      ...rootKeys.userPool({ chainId, poolId, userAddress }),
      'repayBands',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
    ] as const,
  queryFn: async ({
    poolId,
    stateCollateral,
    userCollateral,
    userBorrowed,
  }: RepayFromCollateralQuery): Promise<[number, number]> => {
    const market = getLlamaMarket(poolId)
    return market instanceof LendMarketTemplate
      ? await market.leverage.repayBands(stateCollateral, userCollateral, userBorrowed)
      : market.leverageV2.hasLeverage()
        ? await market.leverageV2.repayBands(stateCollateral, userCollateral, userBorrowed)
        : await market.deleverage.repayBands(userCollateral)
  },
  validationSuite: repayFromCollateralValidationSuite,
})

export const { useQuery: useRepayFromCollateralPrices } = queryFactory({
  queryKey: ({
    chainId,
    poolId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
  }: RepayFromCollateralParams) =>
    [
      ...rootKeys.userPool({ chainId, poolId, userAddress }),
      'repayPrices',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
    ] as const,
  queryFn: async ({ poolId, stateCollateral, userCollateral, userBorrowed }: RepayFromCollateralQuery) => {
    const market = getLlamaMarket(poolId)
    return (
      market instanceof LendMarketTemplate
        ? await market.leverage.repayPrices(stateCollateral, userCollateral, userBorrowed)
        : market.leverageV2.hasLeverage()
          ? await market.leverageV2.repayPrices(stateCollateral, userCollateral, userBorrowed)
          : await market.deleverage.repayPrices(userCollateral)
    ) as Decimal[]
  },
  validationSuite: repayFromCollateralValidationSuite,
})

export const { useQuery: useRepayFromCollateralHealth } = queryFactory({
  queryKey: ({
    chainId,
    poolId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
    isFull,
  }: RepayFromCollateralHealthQuery) =>
    [
      ...rootKeys.userPool({ chainId, poolId, userAddress }),
      'repayHealth',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
      { isFull },
    ] as const,
  queryFn: async ({
    poolId,
    stateCollateral,
    userCollateral,
    userBorrowed,
    isFull,
  }: RepayFromCollateralHealthQuery) => {
    const market = getLlamaMarket(poolId)
    return (
      market instanceof LendMarketTemplate
        ? await market.leverage.repayHealth(stateCollateral, userCollateral, userBorrowed, isFull)
        : market.leverageV2.hasLeverage()
          ? await market.leverageV2.repayHealth(stateCollateral, userCollateral, userBorrowed, isFull)
          : await market.deleverage.repayHealth(userCollateral, isFull)
    ) as Decimal
  },
  validationSuite: repayFromCollateralIsFullValidationSuite,
})
