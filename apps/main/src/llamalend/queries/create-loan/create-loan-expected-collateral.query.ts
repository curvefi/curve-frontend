import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { assert, decimal, Decimal } from '@ui-kit/utils'
import type { CreateLoanDebtParams, CreateLoanDebtQuery } from '../../features/borrow/types'
import { createLoanQueryValidationSuite } from '../validation/borrow.validation'

type CreateLoanExpectedCollateralResult = {
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
}): CreateLoanExpectedCollateralResult => ({
  totalCollateral: totalCollateral as Decimal,
  leverage: leverage as Decimal,
  userCollateral: userCollateral as Decimal,
  avgPrice: decimal(avgPrice),
  collateralFromUserBorrowed: decimal(collateralFromUserBorrowed),
  collateralFromDebt: decimal(collateralFromDebt),
})

export const { useQuery: useCreateLoanExpectedCollateral, queryKey: createLoanExpectedCollateralQueryKey } =
  queryFactory({
    queryKey: ({
      chainId,
      marketId,
      userBorrowed = '0',
      userCollateral = '0',
      debt,
      slippage,
      leverageEnabled,
      maxDebt,
    }: CreateLoanDebtParams) =>
      [
        ...rootKeys.market({ chainId, marketId }),
        'createLoanExpectedCollateral',
        { userCollateral },
        { userBorrowed },
        { debt },
        { slippage },
        { leverageEnabled },
        { maxDebt },
      ] as const,
    queryFn: async ({
      marketId,
      userBorrowed = '0',
      userCollateral = '0',
      debt,
      slippage,
    }: CreateLoanDebtQuery): Promise<CreateLoanExpectedCollateralResult> => {
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
      const { collateral, leverage } = await market.leverage.createLoanCollateral(userCollateral, debt)
      return convertNumbers({ userCollateral, leverage, totalCollateral: collateral })
    },
    staleTime: '1m',
    validationSuite: createLoanQueryValidationSuite({ debtRequired: true, isLeverageRequired: true }),
  })
