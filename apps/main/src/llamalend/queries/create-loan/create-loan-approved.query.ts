import { createLoanExpectedCollateralQueryKey } from '@/llamalend/queries/create-loan/create-loan-expected-collateral.query'
import { getCreateLoanImplementation } from '@/llamalend/queries/create-loan/create-loan-query.helpers'
import { notFalsy } from '@primitives/objects.utils'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { CreateLoanDebtQuery, CreateLoanFormQueryParams } from '../../features/borrow/types'
import { createLoanQueryValidationSuite } from '../validation/borrow.validation'

export const {
  useQuery: useCreateLoanIsApproved,
  fetchQuery: fetchCreateLoanIsApproved,
  invalidate: invalidateCreateLoanIsApproved,
} = queryFactory({
  queryKey: ({ chainId, marketId, userCollateral = '0', leverageEnabled }: CreateLoanFormQueryParams) =>
    [
      ...rootKeys.market({ chainId, marketId }),
      'createLoanIsApproved',
      { userCollateral },
      { leverageEnabled },
    ] as const,
  queryFn: async ({ marketId, userCollateral = '0', leverageEnabled }: CreateLoanDebtQuery): Promise<boolean> => {
    const deprecatedBorrowedFromWallet = '0'
    const [type, impl] = getCreateLoanImplementation(marketId, leverageEnabled)
    switch (type) {
      case 'zapV2':
        return await impl.createLoanIsApproved({ userCollateral })
      case 'V1':
      case 'V2':
        return await impl.createLoanIsApproved(userCollateral, deprecatedBorrowedFromWallet)
      case 'V0':
      case 'unleveraged':
        return await impl.createLoanIsApproved(userCollateral)
    }
  },
  category: 'llamalend.createLoan',
  validationSuite: createLoanQueryValidationSuite({ debtRequired: false }),
  dependencies: params => notFalsy(params.leverageEnabled && createLoanExpectedCollateralQueryKey(params)),
})
