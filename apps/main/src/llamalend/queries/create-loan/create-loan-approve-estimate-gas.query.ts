import { getLlamaMarket } from '@/llamalend/llama.utils'
import { getCreateLoanImplementation } from '@/llamalend/queries/create-loan/create-loan-query.helpers'
import type { IChainId, TGas } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { CreateLoanFormQuery } from '../../features/borrow/types'
import { createApprovedEstimateGasHook } from '../estimate-gas-hook.factory'
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

const { useQuery: useCreateLoanEstimateGasQuery } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    userBorrowed = '0',
    userCollateral = '0',
    debt = '0',
    leverageEnabled,
    range,
    slippage,
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
    ] as const,
  queryFn: async ({
    marketId,
    userBorrowed = '0',
    userCollateral = '0',
    debt = '0',
    leverageEnabled,
    range,
    slippage,
  }: CreateLoanApproveEstimateGasQuery): Promise<TGas> => {
    const market = getLlamaMarket(marketId)
    if (!leverageEnabled) {
      return await market.estimateGas.createLoan(userCollateral, debt, range)
    }
    if (market instanceof LendMarketTemplate) {
      return await market.leverage.estimateGas.createLoan(userCollateral, userBorrowed, debt, range, +slippage)
    }
    return market.leverageV2.hasLeverage()
      ? await market.leverageV2.estimateGas.createLoan(userCollateral, userBorrowed, debt, range, +slippage)
      : await market.leverage.estimateGas.createLoan(userCollateral, debt, range, +slippage)
  },
  validationSuite: createLoanQueryValidationSuite({ debtRequired: true }),
  dependencies: (params) => [createLoanMaxReceiveKey(params)],
})

export const useCreateLoanEstimateGas = createApprovedEstimateGasHook({
  useIsApproved: useCreateLoanIsApproved,
  useApproveEstimate: useCreateLoanApproveEstimateGas,
  useActionEstimate: useCreateLoanEstimateGasQuery,
})
