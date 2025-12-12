import { getLlamaMarket } from '@/llamalend/llama.utils'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { BorrowFormQuery, BorrowFormQueryParams } from '../../features/borrow/types'
import { borrowQueryValidationSuite } from '../validation/borrow.validation'
import { createLoanExpectedCollateralQueryKey } from './create-loan-expected-collateral.query'
import { createLoanMaxReceiveKey } from './create-loan-max-receive.query'

type BorrowBandsResult = [number, number]

export const { useQuery: useCreateLoanBands } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userBorrowed = '0',
    userCollateral = '0',
    debt = '0',
    leverageEnabled,
    range,
  }: BorrowFormQueryParams) =>
    [
      ...rootKeys.market({ chainId, marketId }),
      'createLoanBands',
      { userCollateral },
      { userBorrowed },
      { debt },
      { leverageEnabled },
      { range },
    ] as const,
  queryFn: ({
    marketId,
    userBorrowed = '0',
    userCollateral = '0',
    debt = '0',
    leverageEnabled,
    range,
  }: BorrowFormQuery): Promise<BorrowBandsResult> => {
    const market = getLlamaMarket(marketId)
    return leverageEnabled
      ? market instanceof LendMarketTemplate
        ? market.leverage.createLoanBands(userCollateral, userBorrowed, debt, range)
        : market.leverageV2.hasLeverage()
          ? market.leverageV2.createLoanBands(userCollateral, userBorrowed, debt, range)
          : market.leverage.createLoanBands(userCollateral, debt, range)
      : market.createLoanBands(userCollateral, debt, range)
  },
  staleTime: '1m',
  validationSuite: borrowQueryValidationSuite({ debtRequired: true }),
  dependencies: (params) => [
    createLoanMaxReceiveKey(params),
    ...(params.leverageEnabled ? [createLoanExpectedCollateralQueryKey(params)] : []),
  ],
})
