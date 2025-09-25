import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { assert, fromPrecise, type PreciseNumber, stringNumber, toPrecise, Zero } from '@ui-kit/utils'
import type { BorrowFormQuery, BorrowFormQueryParams } from '../types'
import { borrowQueryValidationSuite } from './borrow.validation'

type BorrowExpectedCollateralResult = {
  totalCollateral: PreciseNumber
  leverage: PreciseNumber
  userCollateral: PreciseNumber
  collateralFromUserBorrowed: PreciseNumber | undefined
  collateralFromDebt: PreciseNumber | undefined
  avgPrice: PreciseNumber | undefined
}

const convertNumbers = ({
  totalCollateral,
  userCollateral,
  collateralFromUserBorrowed,
  collateralFromDebt,
  leverage,
  avgPrice,
}: {
  totalCollateral: string
  leverage: string
  userCollateral: string | number
  collateralFromUserBorrowed?: string
  collateralFromDebt?: string
  avgPrice?: string
}): BorrowExpectedCollateralResult => ({
  totalCollateral: toPrecise(totalCollateral),
  leverage: toPrecise(leverage),
  userCollateral: toPrecise(userCollateral),
  avgPrice: toPrecise(avgPrice),
  collateralFromUserBorrowed: toPrecise(collateralFromUserBorrowed),
  collateralFromDebt: toPrecise(collateralFromDebt),
})

export const { useQuery: useBorrowExpectedCollateral, queryKey: borrowExpectedCollateralQueryKey } = queryFactory({
  queryKey: ({ chainId, poolId, userBorrowed = Zero, userCollateral = Zero, debt, slippage }: BorrowFormQueryParams) =>
    [
      ...rootKeys.pool({ chainId, poolId }),
      'createLoanExpectedCollateral',
      { userCollateral },
      { userBorrowed },
      { debt },
      { slippage },
    ] as const,
  queryFn: async ({
    poolId,
    userBorrowed = Zero,
    userCollateral = Zero,
    debt,
    slippage,
  }: BorrowFormQuery): Promise<BorrowExpectedCollateralResult> => {
    const market = getLlamaMarket(poolId)
    const [collateral, borrowed, userDebt] = [userCollateral, userBorrowed, debt].map(stringNumber)
    const slip = fromPrecise(slippage)
    if (market instanceof LendMarketTemplate) {
      return convertNumbers(await market.leverage.createLoanExpectedCollateral(collateral, borrowed, userDebt, slip))
    }
    if (market.leverageV2.hasLeverage()) {
      return convertNumbers(await market.leverageV2.createLoanExpectedCollateral(collateral, borrowed, userDebt, slip))
    }

    assert(!fromPrecise(userBorrowed), `userBorrowed must be 0 for non-leverage mint markets`)
    const {
      collateral: totalCollateral,
      leverage,
      routeIdx,
    } = await market.leverage.createLoanCollateral(collateral, userDebt)
    return convertNumbers({ userCollateral: collateral, leverage, totalCollateral })
  },
  staleTime: '1m',
  validationSuite: borrowQueryValidationSuite,
})
