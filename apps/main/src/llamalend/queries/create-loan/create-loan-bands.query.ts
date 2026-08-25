import { getCreateLoanImplementation } from '@/llamalend/queries/create-loan/create-loan-query.helpers'
import { parseRoute as parseRoute } from '@evm-ui/entities/router-api'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import type { Range } from '@evm-ui/types/util'
import { notFalsy } from '@primitives/objects.utils'
import type { CreateLoanDebtParams, CreateLoanDebtQuery } from '../../features/borrow/types'
import { createLoanQueryValidationSuite } from '../validation/borrow.validation'
import { createLoanExpectedCollateralQueryKey } from './create-loan-expected-collateral.query'
import { createLoanRouteMaxReceiveKey } from './create-loan-max-receive.query'

type CreateLoanBandsResult = Range<number>

export const { invalidate: invalidateCreateLoanBands } = queryFactory({
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
      'createLoanBands',
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
  }: CreateLoanDebtQuery): Promise<CreateLoanBandsResult> => {
    const [type, impl] = getCreateLoanImplementation(marketId, leverageEnabled)
    switch (type) {
      case 'zapV2':
        return (await impl.createLoanExpectedMetrics({ userCollateral, debt, range, ...parseRoute(routeId) })).bands
      case 'V0':
      case 'unleveraged':
        return impl.createLoanBands(userCollateral, debt, range)
    }
  },
  category: 'llamalend.createLoan',
  validationSuite: createLoanQueryValidationSuite({ debtRequired: true }),
  dependencies: params => [
    createLoanRouteMaxReceiveKey(params),
    ...notFalsy(params.leverageEnabled && createLoanExpectedCollateralQueryKey(params)),
  ],
})
