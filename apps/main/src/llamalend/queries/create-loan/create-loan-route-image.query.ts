import { createLoanExpectedCollateralQueryKey } from '@/llamalend/queries/create-loan/create-loan-expected-collateral.query'
import { getCreateLoanImplementation } from '@/llamalend/queries/create-loan/create-loan-query.helpers'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { CreateLoanDebtParams, CreateLoanDebtQuery } from '../../features/borrow/types'
import { createLoanQueryValidationSuite } from '../validation/borrow.validation'

export const { useQuery: useCreateLoanRouteImage } = queryFactory({
  queryKey: ({ chainId, marketId, userBorrowed = '0', debt = '0', maxDebt, leverageEnabled }: CreateLoanDebtParams) =>
    [
      ...rootKeys.market({ chainId, marketId }),
      'createLoanRouteImage',
      { userBorrowed },
      { debt },
      { maxDebt },
      { leverageEnabled },
    ] as const,
  queryFn: async ({ marketId, userBorrowed = '0', debt = '0', leverageEnabled }: CreateLoanDebtQuery) => {
    const [type, impl] = getCreateLoanImplementation(marketId, leverageEnabled)
    switch (type) {
      case 'V1':
      case 'V2':
        return await impl.createLoanRouteImage(userBorrowed, debt)
      case 'V0':
      case 'unleveraged':
      case 'zapV2':
        return null // todo: retrieve image or image data from api
    }
  },
  staleTime: '1m',
  validationSuite: createLoanQueryValidationSuite({ debtRequired: true }),
  dependencies: (params) => [createLoanExpectedCollateralQueryKey(params)],
})
