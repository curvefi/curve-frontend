import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { decimal, type Decimal } from '@ui-kit/utils'
import { type RepayFromCollateralParams, type RepayFromCollateralQuery } from '../manage-loan.types'
import { repayFromCollateralValidationSuite } from '../manage-loan.validation'

type RepayExpectedBorrowedResult = {
  totalBorrowed: Decimal
  borrowedFromStateCollateral: Decimal
  borrowedFromUserCollateral: Decimal
  userBorrowed: Decimal
  avgPrice: Decimal
}

const convertNumbers = ({
  totalBorrowed,
  borrowedFromStateCollateral,
  borrowedFromUserCollateral,
  userBorrowed,
  avgPrice,
}: {
  totalBorrowed: string
  borrowedFromStateCollateral: string
  borrowedFromUserCollateral: string
  userBorrowed: string
  avgPrice: string
}): RepayExpectedBorrowedResult => ({
  totalBorrowed: totalBorrowed as Decimal,
  borrowedFromStateCollateral: decimal(borrowedFromStateCollateral),
  borrowedFromUserCollateral: decimal(borrowedFromUserCollateral),
  userBorrowed: userBorrowed as Decimal,
  avgPrice: decimal(avgPrice),
})

export const { useQuery: useRepayFromCollateralExpectedBorrowed } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
  }: RepayFromCollateralParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repayExpectedBorrowed',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
    ] as const,
  queryFn: async ({
    marketId,
    stateCollateral,
    userCollateral,
    userBorrowed,
  }: RepayFromCollateralQuery): Promise<RepayExpectedBorrowedResult | null> => {
    const market = getLlamaMarket(marketId)
    if (market instanceof LendMarketTemplate) {
      return convertNumbers(await market.leverage.repayExpectedBorrowed(stateCollateral, userCollateral, userBorrowed))
    }
    if (market.leverageV2.hasLeverage()) {
      return convertNumbers(
        await market.leverageV2.repayExpectedBorrowed(stateCollateral, userCollateral, userBorrowed),
      )
    }
    return null
  },
  staleTime: '1m',
  validationSuite: repayFromCollateralValidationSuite,
})
