import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { assert } from '@ui-kit/utils'
import type { BorrowFormQuery, BorrowFormQueryParams } from '../types'
import { borrowQueryValidationSuite } from './borrow.validation'

type BorrowExpectedCollateralResult = {
  totalCollateral: number
  leverage: number
  userCollateral: number
  collateralFromUserBorrowed: number | undefined
  collateralFromDebt: number | undefined
  avgPrice: number | undefined
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
  totalCollateral: +totalCollateral,
  leverage: +leverage,
  userCollateral: +userCollateral,
  avgPrice: avgPrice == null ? undefined : +avgPrice,
  collateralFromUserBorrowed: collateralFromUserBorrowed == null ? undefined : +collateralFromUserBorrowed,
  collateralFromDebt: collateralFromDebt == null ? undefined : +collateralFromDebt,
})

export const { useQuery: useBorrowExpectedCollateral, queryKey: borrowExpectedCollateralQueryKey } = queryFactory({
  queryKey: ({ chainId, poolId, userBorrowed = 0, userCollateral = 0, debt, slippage }: BorrowFormQueryParams) =>
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
    userBorrowed = 0,
    userCollateral = 0,
    debt,
    slippage,
  }: BorrowFormQuery): Promise<BorrowExpectedCollateralResult> => {
    const market = getLlamaMarket(poolId)
    if (market instanceof LendMarketTemplate) {
      return convertNumbers(
        await market.leverage.createLoanExpectedCollateral(userCollateral, userBorrowed, debt, +slippage),
      )
    }
    if (market.leverageV2.hasLeverage()) {
      return convertNumbers(
        await market.leverageV2.createLoanExpectedCollateral(userCollateral, userBorrowed, debt, +slippage),
      )
    }

    assert(userBorrowed == 0, `userBorrowed must be 0 for non-leverage mint markets`)
    const { collateral, leverage, routeIdx } = await market.leverage.createLoanCollateral(userCollateral, debt)
    return convertNumbers({ userCollateral, leverage, totalCollateral: collateral })
  },
  staleTime: '1m',
  validationSuite: borrowQueryValidationSuite,
})
