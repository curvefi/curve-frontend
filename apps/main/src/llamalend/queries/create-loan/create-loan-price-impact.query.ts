import { getCreateLoanImplementation } from '@/llamalend/queries/create-loan/create-loan-query.helpers'
import type { Decimal } from '@primitives/decimal.utils'
import { parseRoute as parseRoute } from '@ui-kit/entities/router-api'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { decimal } from '@ui-kit/utils'
import type { CreateLoanDebtParams, CreateLoanDebtQuery } from '../../features/borrow/types'
import { createLoanQueryValidationSuite } from '../validation/borrow.validation'
import { createLoanExpectedCollateralQueryKey } from './create-loan-expected-collateral.query'

export const {
  useQuery: useCreateLoanPriceImpact,
  invalidate: invalidateCreateLoanPriceImpact,
  refetchQuery: refetchCreateLoanPriceImpact,
} = queryFactory({
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
  }: CreateLoanDebtQuery): Promise<Decimal | null> => {
    const [type, impl] = getCreateLoanImplementation(marketId, leverageEnabled)
    switch (type) {
      case 'zapV2': {
        const { priceImpact } = await impl.createLoanExpectedMetrics({
          userCollateral,
          userBorrowed,
          debt,
          range,
          ...parseRoute(routeId),
        })
        return decimal(priceImpact) ?? null
      }
      case 'V1':
      case 'V2':
        return decimal(await impl.createLoanPriceImpact(userBorrowed, debt)) ?? null
      case 'V0':
        return decimal(await impl.priceImpact(userCollateral, debt)) ?? null
      case 'unleveraged':
        return '0' // there is no price impact, user repays debt directly
    }
  },
  category: 'llamalend.createLoan',
  validationSuite: createLoanQueryValidationSuite({ debtRequired: true, isLeverageRequired: true }),
  dependencies: params => [createLoanExpectedCollateralQueryKey(params)],
})
