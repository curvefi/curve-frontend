import { getCreateLoanImplementation } from '@/llamalend/queries/create-loan/create-loan-query.helpers'
import type { Decimal } from '@primitives/decimal.utils'
import { parseRoute as parseRoute } from '@ui-kit/entities/router-api'
import { type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { CreateLoanDebtQuery, CreateLoanForm, CreateLoanFormQuery } from '../../features/borrow/types'
import { createLoanQueryValidationSuite } from '../validation/borrow.validation'
import { createLoanExpectedCollateralQueryKey } from './create-loan-expected-collateral.query'
import { createLoanMaxReceiveKey } from './create-loan-max-receive.query'

type CreateLoanPricesReceiveQuery = CreateLoanFormQuery & Pick<CreateLoanForm, 'maxDebt'>
export type CreateLoanPricesReceiveParams = FieldsOf<CreateLoanPricesReceiveQuery>

type CreateLoanPricesResult = [Decimal, Decimal]
const convertNumbers = (prices: string[]) => [prices[0], prices[1]] as CreateLoanPricesResult

export const { useQuery: useCreateLoanPrices, invalidate: invalidateCreateLoanPrices } = queryFactory({
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
  }: CreateLoanDebtQuery): Promise<CreateLoanPricesResult> => {
    const [type, impl] = getCreateLoanImplementation(marketId, leverageEnabled)
    switch (type) {
      case 'zapV2':
        return (
          await impl.createLoanExpectedMetrics({ userCollateral, userBorrowed, debt, range, ...parseRoute(routeId) })
        ).prices as [Decimal, Decimal]
      case 'V1':
      case 'V2':
        return convertNumbers(await impl.createLoanPrices(userCollateral, userBorrowed, debt, range))
      case 'V0':
      case 'unleveraged':
        return convertNumbers(await impl.createLoanPrices(userCollateral, debt, range))
    }
  },
  category: 'user',
  validationSuite: createLoanQueryValidationSuite({ debtRequired: true }),
  dependencies: (params) => [
    createLoanMaxReceiveKey(params),
    ...(params.leverageEnabled ? [createLoanExpectedCollateralQueryKey(params)] : []),
  ],
})
