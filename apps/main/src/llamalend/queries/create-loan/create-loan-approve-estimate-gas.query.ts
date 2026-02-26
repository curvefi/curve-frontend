import { createLoanExpectedCollateralQueryKey } from '@/llamalend/queries/create-loan/create-loan-expected-collateral.query'
import { getCreateLoanImplementation } from '@/llamalend/queries/create-loan/create-loan-query.helpers'
import type { IChainId, TGas } from '@curvefi/llamalend-api/lib/interfaces'
import { parseRoute as parseRoute2 } from '@ui-kit/entities/router-api'
import { type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { createApprovedEstimateGasHook } from '@ui-kit/lib/model/entities/gas-info'
import type { CreateLoanFormQuery } from '../../features/borrow/types'
import { createLoanQueryValidationSuite } from '../validation/borrow.validation'
import { useCreateLoanIsApproved } from './create-loan-approved.query'
import { createLoanMaxReceiveKey } from './create-loan-max-receive.query'

type CreateLoanApproveEstimateGasQuery<T = IChainId> = CreateLoanFormQuery<T>
type GasEstimateParams<T = IChainId> = FieldsOf<CreateLoanApproveEstimateGasQuery<T>>

const { useQuery: useCreateLoanApproveEstimateGas } = queryFactory({
  queryKey: ({ chainId, marketId, userBorrowed = '0', userCollateral = '0', leverageEnabled }: GasEstimateParams) =>
    [
      ...rootKeys.market({ chainId, marketId }),
      'estimateGas.createLoanApprove',
      { userBorrowed },
      { userCollateral },
      { leverageEnabled },
    ] as const,
  queryFn: async ({
    marketId,
    userBorrowed = '0',
    userCollateral = '0',
    leverageEnabled,
  }: CreateLoanApproveEstimateGasQuery) => {
    const [type, impl] = getCreateLoanImplementation(marketId, leverageEnabled)
    switch (type) {
      case 'zapV2':
        return await impl.estimateGas.createLoanApprove({ userCollateral, userBorrowed })
      case 'V1':
      case 'V2':
        return await impl.estimateGas.createLoanApprove(userCollateral, userBorrowed)
      case 'V0':
      case 'unleveraged':
        return await impl.estimateGas.createLoanApprove(userCollateral)
    }
  },
  validationSuite: createLoanQueryValidationSuite({ debtRequired: false }),
  dependencies: (params) => [createLoanMaxReceiveKey(params)],
})

const { useQuery: useCreateLoanEstimateGasQuery, invalidate: invalidateCreateLoanEstimateGasQuery } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userBorrowed = '0',
    userCollateral = '0',
    debt = '0',
    leverageEnabled,
    range,
    slippage,
    routeId,
  }: GasEstimateParams) =>
    [
      ...rootKeys.market({ chainId, marketId }),
      'estimateGas.createLoan',
      { userBorrowed },
      { userCollateral },
      { debt },
      { leverageEnabled },
      { range },
      { slippage },
      { routeId },
    ] as const,
  queryFn: async ({
    marketId,
    userBorrowed = '0',
    userCollateral = '0',
    debt = '0',
    leverageEnabled,
    range,
    slippage,
    routeId,
  }: CreateLoanApproveEstimateGasQuery): Promise<TGas> => {
    const [type, impl] = getCreateLoanImplementation(marketId, leverageEnabled)
    switch (type) {
      case 'zapV2':
        return await impl.estimateGas.createLoan({ userCollateral, userBorrowed, debt, range, ...parseRoute2(routeId) })
      case 'V1':
      case 'V2':
        return await impl.estimateGas.createLoan(userCollateral, userBorrowed, debt, range, +slippage)
      case 'V0':
        return await impl.estimateGas.createLoan(userCollateral, debt, range, +slippage)
      case 'unleveraged':
        return await impl.estimateGas.createLoan(userCollateral, debt, range)
    }
  },
  validationSuite: createLoanQueryValidationSuite({ debtRequired: true }),
  dependencies: (params) => [
    createLoanMaxReceiveKey(params),
    ...(params.leverageEnabled ? [createLoanExpectedCollateralQueryKey(params)] : []),
  ],
})

export const useCreateLoanEstimateGas = createApprovedEstimateGasHook({
  useIsApproved: useCreateLoanIsApproved,
  useApproveEstimate: useCreateLoanApproveEstimateGas,
  useActionEstimate: useCreateLoanEstimateGasQuery,
})

export { invalidateCreateLoanEstimateGasQuery }
