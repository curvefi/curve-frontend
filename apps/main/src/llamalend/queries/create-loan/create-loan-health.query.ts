import { getCreateLoanImplementation } from '@/llamalend/queries/create-loan/create-loan-query.helpers'
import type { Decimal } from '@primitives/decimal.utils'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { decimal } from '@ui-kit/utils'
import type { CreateLoanDebtParams, CreateLoanDebtQuery } from '../../features/borrow/types'
import { createLoanQueryValidationSuite } from '../validation/borrow.validation'
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
    maxDebt,
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
    ] as const,
  queryFn: async ({
    marketId,
    userBorrowed = '0',
    userCollateral = '0',
    debt = '0',
    leverageEnabled,
    range,
  }: CreateLoanDebtQuery): Promise<Decimal> => {
    const [type, impl] = getCreateLoanImplementation(marketId, leverageEnabled)
    switch (type) {
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
