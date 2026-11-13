import { getCreateLoanImplementation } from '@/llamalend/queries/create-loan/create-loan-query.helpers'
import { parseRoute as parseRoute } from '@evm-ui/queries/router-api/utils'
import type { Decimal } from '@primitives/decimal.utils'
import { notFalsy } from '@primitives/objects.utils'
import { queryFactory } from '@ui/features/queries/factory'
import { decimal } from '@ui/lib/decimal'
import type { FieldsOf } from '@ui/lib/validation/types'
import type { CreateLoanDebtQuery } from '../../features/borrow/types'
import { createLoanQueryValidationSuite } from '../validation/borrow.validation'
import { createLoanExpectedCollateralQueryKey } from './create-loan-expected-collateral.query'
import { createLoanRouteMaxReceiveKey } from './create-loan-max-receive.query'

type CreateLoanHealthQuery = CreateLoanDebtQuery & { isFull: boolean }
type CreateLoanHealthParams = FieldsOf<CreateLoanHealthQuery>

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
    isFull,
  }: CreateLoanHealthParams) =>
    ({
      name: 'createLoanHealth',
      chainId,
      marketId,
      userCollateral,
      userBorrowed,
      debt,
      leverageEnabled,
      range,
      maxDebt,
      routeId,
      isFull,
    }) as const,
  queryFn: async ({
    marketId,
    userCollateral = '0',
    debt = '0',
    leverageEnabled,
    range,
    routeId,
    isFull,
  }: CreateLoanHealthQuery): Promise<Decimal> => {
    const [type, impl] = getCreateLoanImplementation(marketId, leverageEnabled)
    switch (type) {
      case 'zapV2':
        return decimal(
          (
            await impl.createLoanExpectedMetrics({
              userCollateral,
              debt,
              range,
              ...parseRoute(routeId),
              healthIsFull: isFull,
            })
          ).health,
        )!
      case 'V0':
      case 'unleveraged':
        return decimal(await impl.createLoanHealth(userCollateral, debt, range, isFull))!
    }
  },
  category: 'llamalend.createLoan',
  validationSuite: createLoanQueryValidationSuite({ debtRequired: true, ignoreMaxCollateral: true }),
  dependencies: params => [
    createLoanRouteMaxReceiveKey(params),
    ...notFalsy(params.leverageEnabled && createLoanExpectedCollateralQueryKey(params)),
  ],
})
