import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { BorrowFormQuery, BorrowFormQueryParams } from '../borrow.types'
import { getLlamaMarket } from '../llama.util'
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
  queryKey: ({
    chainId,
    poolId,
    userBorrowed = 0,
    userCollateral = 0,
    debt,
    leverage,
    slippage,
  }: BorrowFormQueryParams) =>
    [
      ...rootKeys.pool({ chainId, poolId }),
      'borrow-expected-collateral',
      { userCollateral },
      { userBorrowed },
      { debt },
      { leverage },
      { slippage },
    ] as const,
  queryFn: async ({
    poolId,
    userBorrowed = 0,
    userCollateral = 0,
    debt,
    leverage: requestedLeverage,
    slippage,
  }: BorrowFormQuery): Promise<BorrowExpectedCollateralResult> => {
    const [market, type] = getLlamaMarket(poolId)
    if (!requestedLeverage) {
      throw new Error(`Leverage is required to calculate expected collateral`)
    }
    if (type === LlamaMarketType.Lend) {
      return convertNumbers(
        await market.leverage.createLoanExpectedCollateral(userCollateral, userBorrowed, debt, slippage),
      )
    }
    if (market.leverageV2.hasLeverage()) {
      return convertNumbers(
        await market.leverageV2.createLoanExpectedCollateral(userCollateral, userBorrowed, debt, slippage),
      )
    }

    console.assert(userBorrowed == 0, `userBorrowed must be 0 for non-leverage mint markets`)
    const { collateral, leverage, routeIdx } = await market.leverage.createLoanCollateral(userCollateral, debt)
    return convertNumbers({ userCollateral, leverage, totalCollateral: collateral })
  },
  staleTime: '1m',
  validationSuite: borrowQueryValidationSuite,
})
