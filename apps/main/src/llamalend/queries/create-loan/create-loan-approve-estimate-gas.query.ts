import type { Suite } from 'vest'
import { useEstimateGas } from '@/llamalend/hooks/useEstimateGas'
import { type NetworkDict } from '@/llamalend/llamalend.types'
import { getCreateLoanImplementation } from '@/llamalend/queries/create-loan/create-loan-query.helpers'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { CreateLoanFormQuery } from '../../features/borrow/types'
import { createLoanQueryValidationSuite } from '../validation/borrow.validation'
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
      case 'V1':
      case 'V2':
        return await impl.estimateGas.createLoanApprove(userCollateral, userBorrowed)
      case 'V0':
      case 'unleveraged':
        return await impl.estimateGas.createLoanApprove(userCollateral)
    }
  },
  validationSuite: createLoanQueryValidationSuite({ debtRequired: false }) as Suite<
    keyof CreateLoanApproveEstimateGasQuery,
    string
  >,
  dependencies: (params) => [createLoanMaxReceiveKey(params)],
})

// todo: expand this to consider estimation after approval, see `useRepayEstimateGas`
export const useCreateLoanEstimateGas = <ChainId extends IChainId>(
  networks: NetworkDict<ChainId>,
  query: GasEstimateParams<ChainId>,
  enabled?: boolean,
) => {
  const { chainId } = query
  const { data: estimate, isLoading: estimateLoading, error } = useCreateLoanApproveEstimateGas(query, enabled)
  const {
    data,
    isLoading: conversionLoading,
    error: estimateError,
  } = useEstimateGas<ChainId>(networks, chainId, estimate, enabled)
  return { data, isLoading: estimateLoading || conversionLoading, error: error ?? estimateError }
}
