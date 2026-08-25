import { getCreateLoanImplementation } from '@/llamalend/queries/create-loan/create-loan-query.helpers'
import { parseRoute as parseRoute } from '@evm-ui/entities/router-api'
import { type FieldsOf } from '@evm-ui/lib'
import { queryFactory, rootKeys } from '@evm-ui/lib/model'
import type { Decimal } from '@primitives/decimal.utils'
import { notFalsy } from '@primitives/objects.utils'
import type { CreateLoanDebtQuery, CreateLoanForm, CreateLoanFormQuery } from '../../features/borrow/types'
import { createLoanQueryValidationSuite } from '../validation/borrow.validation'
import { createLoanExpectedCollateralQueryKey } from './create-loan-expected-collateral.query'
import { createLoanRouteMaxReceiveKey } from './create-loan-max-receive.query'

type CreateLoanPricesReceiveQuery = CreateLoanFormQuery & Pick<CreateLoanForm, 'maxDebt'>
type CreateLoanPricesReceiveParams = FieldsOf<CreateLoanPricesReceiveQuery>

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
    userCollateral = '0',
    debt = '0',
    leverageEnabled,
    range,
    routeId,
  }: CreateLoanDebtQuery): Promise<CreateLoanPricesResult> => {
    const [type, impl] = getCreateLoanImplementation(marketId, leverageEnabled)
    switch (type) {
      case 'zapV2':
        return (await impl.createLoanExpectedMetrics({ userCollateral, debt, range, ...parseRoute(routeId) }))
          .prices as [Decimal, Decimal]
      case 'V0':
      case 'unleveraged':
        return convertNumbers(await impl.createLoanPrices(userCollateral, debt, range))
    }
  },
  category: 'llamalend.createLoan',
  validationSuite: createLoanQueryValidationSuite({ debtRequired: true, ignoreMaxCollateral: true }),
  dependencies: params => [
    createLoanRouteMaxReceiveKey(params),
    ...notFalsy(params.leverageEnabled && createLoanExpectedCollateralQueryKey(params)),
  ],
})
