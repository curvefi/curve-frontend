import { createLoanExpectedCollateralQueryKey } from '@/llamalend/queries/create-loan/create-loan-expected-collateral.query'
import { getCreateLoanImplementation } from '@/llamalend/queries/create-loan/create-loan-query.helpers'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { CreateLoanDebtQuery, CreateLoanFormQueryParams } from '../../features/borrow/types'
import { createLoanQueryValidationSuite } from '../validation/borrow.validation'

export const {
  useQuery: useCreateLoanIsApproved,
  fetchQuery: fetchCreateLoanIsApproved,
  invalidate: invalidateCreateLoanIsApproved,
} = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userCollateral = '0',
    userBorrowed = '0',
    leverageEnabled,
  }: CreateLoanFormQueryParams) =>
    [
      ...rootKeys.market({ chainId, marketId }),
      'createLoanIsApproved',
      { userCollateral },
      { userBorrowed },
      { leverageEnabled },
    ] as const,
  queryFn: async ({
    marketId,
    userBorrowed = '0',
    userCollateral = '0',
    leverageEnabled,
  }: CreateLoanDebtQuery): Promise<boolean> => {
    const [type, impl] = getCreateLoanImplementation(marketId, leverageEnabled)
    switch (type) {
      case 'zapV2':
        return await impl.createLoanIsApproved({ userCollateral, userBorrowed })
      case 'V1':
      case 'V2':
        return await impl.createLoanIsApproved(userCollateral, userBorrowed)
      case 'V0':
      case 'unleveraged':
        return await impl.createLoanIsApproved(userCollateral)
    }
  },
  category: 'llamalend.createLoan',
  validationSuite: createLoanQueryValidationSuite({ debtRequired: false }),
  dependencies: (params) => (params.leverageEnabled ? [createLoanExpectedCollateralQueryKey(params)] : []),
})
