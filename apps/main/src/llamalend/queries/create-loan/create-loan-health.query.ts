import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { Decimal } from '@ui-kit/utils'
import { decimal } from '@ui-kit/utils'
import type { BorrowFormQuery, BorrowFormQueryParams } from '../../features/borrow/types'
import { borrowQueryValidationSuite } from '../validation/borrow.validation'
import { createLoanExpectedCollateralQueryKey } from './create-loan-expected-collateral.query'
import { createLoanMaxReceiveKey } from './create-loan-max-receive.query'

export const { useQuery: useCreateLoanHealth } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userBorrowed,
    userCollateral,
    debt,
    leverageEnabled,
    range,
  }: BorrowFormQueryParams) =>
    [
      ...rootKeys.market({ chainId, marketId }),
      'createLoanHealth',
      { userCollateral },
      { userBorrowed },
      { debt },
      { leverageEnabled },
      { range },
    ] as const,
  queryFn: async ({
    marketId,
    userBorrowed = '0',
    userCollateral = '0',
    debt = '0',
    leverageEnabled,
    range,
  }: BorrowFormQuery): Promise<Decimal> => {
    const market = getLlamaMarket(marketId)
    return decimal(
      leverageEnabled
        ? market instanceof LendMarketTemplate
          ? await market.leverage.createLoanHealth(userCollateral, userBorrowed, debt, range)
          : market.leverageV2.hasLeverage()
            ? await market.leverageV2.createLoanHealth(userCollateral, userBorrowed, debt, range)
            : await market.leverage.createLoanHealth(userCollateral, debt, range)
        : await market.createLoanHealth(userCollateral, debt, range),
    )!
  },
  staleTime: '1m',
  validationSuite: borrowQueryValidationSuite,
  dependencies: (params) => [
    createLoanMaxReceiveKey(params),
    ...(params.leverageEnabled ? [createLoanExpectedCollateralQueryKey(params)] : []),
  ],
})
