import { getCreateLoanImplementation } from '@/llamalend/queries/create-loan/create-loan-query.helpers'
import type { Decimal } from '@primitives/decimal.utils'
import { parseRoute as parseRoute2 } from '@ui-kit/entities/router-api'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { decimal } from '@ui-kit/utils'
import type { CreateLoanDebtParams, CreateLoanDebtQuery } from '../../features/borrow/types'
import { createLoanQueryValidationSuite } from '../validation/borrow.validation'
import { createLoanExpectedCollateralQueryKey } from './create-loan-expected-collateral.query'
import { createLoanMaxReceiveKey } from './create-loan-max-receive.query'

export const { useQuery: useCreateLoanHealth, invalidate: invalidateCreateLoanHealth } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userBorrowed,
    userCollateral,
    debt,
    leverageEnabled,
    range,
    maxDebt,
    routeId,
  }: CreateLoanDebtParams) =>
    [
      ...rootKeys.market({ chainId, marketId }),
      'createLoanHealth',
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
  }: CreateLoanDebtQuery): Promise<Decimal> => {
    const [type, impl] = getCreateLoanImplementation(marketId, leverageEnabled)
    switch (type) {
      case 'zapV2':
        return decimal(
          (await impl.createLoanExpectedMetrics({ userCollateral, userBorrowed, debt, range, ...parseRoute2(routeId) }))
            .health,
        )!
      case 'V1':
      case 'V2':
        return decimal(await impl.createLoanHealth(userCollateral, userBorrowed, debt, range))!
      case 'V0':
      case 'unleveraged':
        return decimal(await impl.createLoanHealth(userCollateral, debt, range))!
    }
  },
  staleTime: '1m',
  validationSuite: createLoanQueryValidationSuite({ debtRequired: true }),
  dependencies: (params) => [
    createLoanMaxReceiveKey(params),
    ...(params.leverageEnabled ? [createLoanExpectedCollateralQueryKey(params)] : []),
  ],
})
