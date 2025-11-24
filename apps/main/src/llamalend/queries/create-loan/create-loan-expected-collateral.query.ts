import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { assert, decimal, Decimal } from '@ui-kit/utils'
import type { BorrowFormQuery, BorrowFormQueryParams } from '../../features/borrow/types'
import { borrowQueryValidationSuite } from '../validation/borrow.validation'

type BorrowExpectedCollateralResult = {
  totalCollateral: Decimal
  leverage: Decimal
  userCollateral: Decimal
  collateralFromUserBorrowed: Decimal | undefined
  collateralFromDebt: Decimal | undefined
  avgPrice: Decimal | undefined
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
  totalCollateral: totalCollateral as Decimal,
  leverage: leverage as Decimal,
  userCollateral: userCollateral as Decimal,
  avgPrice: decimal(avgPrice),
  collateralFromUserBorrowed: decimal(collateralFromUserBorrowed),
  collateralFromDebt: decimal(collateralFromDebt),
})

export const {
  useQuery: useCreateLoanExpectedCollateral,
  queryKey: createLoanExpectedCollateralQueryKey,
  fetchQuery: fetchLoanExpectedCollateral,
} = queryFactory({
  queryKey: ({ chainId, marketId, userBorrowed = '0', userCollateral = '0', debt, slippage }: BorrowFormQueryParams) =>
    [
      ...rootKeys.market({ chainId, marketId }),
      'createLoanExpectedCollateral',
      { userCollateral },
      { userBorrowed },
      { debt },
      { slippage },
    ] as const,
  queryFn: async ({
    marketId,
    userBorrowed = '0',
    userCollateral = '0',
    debt,
    slippage,
  }: BorrowFormQuery): Promise<BorrowExpectedCollateralResult> => {
    const market = getLlamaMarket(marketId)
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

    assert(!+userBorrowed, `userBorrowed must be 0 for non-leverage mint markets`)
    const { collateral, leverage, routeIdx } = await market.leverage.createLoanCollateral(userCollateral, debt)
    return convertNumbers({ userCollateral, leverage, totalCollateral: collateral })
  },
  staleTime: '1m',
  validationSuite: borrowQueryValidationSuite,
})
