import { getCreateLoanImplementation } from '@/llamalend/queries/create-loan/create-loan-query.helpers'
import type { Decimal } from '@primitives/decimal.utils'
import { notFalsy } from '@primitives/objects.utils'
import { parseRoute as parseRoute } from '@evm-ui/entities/router-api'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import { decimal } from '@evm-ui/utils'
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
          (await impl.createLoanExpectedMetrics({ userCollateral, debt, range, ...parseRoute(routeId) })).health,
        )!
      case 'V0':
      case 'unleveraged':
        return decimal(await impl.createLoanHealth(userCollateral, debt, range))!
    }
  },
  category: 'llamalend.createLoan',
  validationSuite: createLoanQueryValidationSuite({ debtRequired: true, ignoreMaxCollateral: true }),
  dependencies: params => [
    createLoanMaxReceiveKey(params),
    ...notFalsy(params.leverageEnabled && createLoanExpectedCollateralQueryKey(params)),
  ],
})
