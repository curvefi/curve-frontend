import { getCreateLoanImplementation } from '@/llamalend/queries/create-loan/create-loan-query.helpers'
import { type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { Decimal } from '@ui-kit/utils'
import { parseRoute } from '@ui-kit/widgets/RouteProvider'
import type { CreateLoanDebtQuery, CreateLoanForm, CreateLoanFormQuery } from '../../features/borrow/types'
import { createLoanQueryValidationSuite } from '../validation/borrow.validation'
import { createLoanExpectedCollateralQueryKey } from './create-loan-expected-collateral.query'
import { createLoanMaxReceiveKey } from './create-loan-max-receive.query'

type CreateLoanPricesReceiveQuery = CreateLoanFormQuery & Pick<CreateLoanForm, 'maxDebt'>
export type CreateLoanPricesReceiveParams = FieldsOf<CreateLoanPricesReceiveQuery>

type CreateLoanPricesResult = [Decimal, Decimal]
const convertNumbers = (prices: string[]) => [prices[0], prices[1]] as CreateLoanPricesResult

export const { useQuery: useCreateLoanPrices } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userBorrowed = '0',
    userCollateral = '0',
    debt = '0',
    leverageEnabled,
    range,
    maxDebt,
    route,
  }: CreateLoanPricesReceiveParams) =>
    [
      ...rootKeys.market({ chainId, marketId }),
      'createLoanPrices',
      { userCollateral },
      { userBorrowed },
      { debt },
      { leverageEnabled },
      { range },
      { maxDebt },
      { route },
    ] as const,
  queryFn: async ({
    marketId,
    userBorrowed = '0',
    userCollateral = '0',
    debt = '0',
    leverageEnabled,
    range,
    route,
  }: CreateLoanDebtQuery): Promise<CreateLoanPricesResult> => {
    const [type, impl] = getCreateLoanImplementation(marketId, leverageEnabled)
    switch (type) {
      case 'zapV2':
        return (
          await impl.createLoanExpectedMetrics({ userCollateral, userBorrowed, debt, range, ...parseRoute(route) })
        ).prices as [Decimal, Decimal]
      case 'V1':
      case 'V2':
        return convertNumbers(await impl.createLoanPrices(userCollateral, userBorrowed, debt, range))
      case 'V0':
      case 'unleveraged':
        return convertNumbers(await impl.createLoanPrices(userCollateral, debt, range))
    }
  },
  staleTime: '1m',
  validationSuite: createLoanQueryValidationSuite({ debtRequired: true }),
  dependencies: (params) => [
    createLoanMaxReceiveKey(params),
    ...(params.leverageEnabled ? [createLoanExpectedCollateralQueryKey(params)] : []),
  ],
})
