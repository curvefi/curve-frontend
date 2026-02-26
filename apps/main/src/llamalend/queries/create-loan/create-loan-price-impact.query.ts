import { getCreateLoanImplementation } from '@/llamalend/queries/create-loan/create-loan-query.helpers'
import { parseRoute as parseRoute2 } from '@ui-kit/entities/router-api'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { CreateLoanDebtParams, CreateLoanDebtQuery } from '../../features/borrow/types'
import { createLoanQueryValidationSuite } from '../validation/borrow.validation'
import { createLoanExpectedCollateralQueryKey } from './create-loan-expected-collateral.query'

type CreateLoanPriceImpactResult = number // percentage

export const { useQuery: useCreateLoanPriceImpact, invalidate: invalidateCreateLoanPriceImpact } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userBorrowed = '0',
    userCollateral = '0',
    debt = '0',
    leverageEnabled,
    range,
    maxDebt,
    routeId,
  }: CreateLoanDebtParams) =>
    [
      ...rootKeys.market({ chainId, marketId }),
      'createLoanPriceImpact',
      { userCollateral },
      { userBorrowed },
      { debt },
      { leverageEnabled },
      { range },
      { maxDebt },
      { routeId },
    ] as const,
  queryFn: async ({
    marketId,
    userBorrowed = '0',
    userCollateral = '0',
    debt = '0',
    leverageEnabled,
    range,
    routeId,
  }: CreateLoanDebtQuery): Promise<CreateLoanPriceImpactResult> => {
    const [type, impl] = getCreateLoanImplementation(marketId, leverageEnabled)
    switch (type) {
      case 'zapV2':
        return +(
          await impl.createLoanExpectedMetrics({ userCollateral, userBorrowed, debt, range, ...parseRoute2(routeId) })
        ).priceImpact
      case 'V1':
      case 'V2':
        return +(await impl.createLoanPriceImpact(userBorrowed, debt))
      case 'V0':
        return +(await impl.priceImpact(userCollateral, debt))
      case 'unleveraged':
        throw new Error('Price impact is only available for leveraged create loan')
    }
  },
  staleTime: '1m',
  validationSuite: createLoanQueryValidationSuite({ debtRequired: true, isLeverageRequired: true }),
  dependencies: (params) => [createLoanExpectedCollateralQueryKey(params)],
})
