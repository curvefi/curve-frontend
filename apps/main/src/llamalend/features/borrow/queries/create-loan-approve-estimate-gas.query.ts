import { useEstimateGas } from '@/llamalend/hooks/useEstimateGas'
import { getLlamaMarket } from '@/llamalend/llama.utils'
import { type NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { BorrowFormQuery } from '../types'
import { borrowQueryValidationSuite } from './borrow.validation'
import { createLoanMaxReceiveKey } from './create-loan-max-receive.query'

type CreateLoanApproveEstimateGasQuery<T = IChainId> = BorrowFormQuery<T>
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
    const market = getLlamaMarket(marketId)
    return {
      createLoanApprove: !leverageEnabled
        ? await market.estimateGas.createLoanApprove(userCollateral)
        : market instanceof LendMarketTemplate
          ? await market.leverage.estimateGas.createLoanApprove(userCollateral, userBorrowed)
          : market.leverageV2.hasLeverage()
            ? await market.leverageV2.estimateGas.createLoanApprove(userCollateral, userBorrowed)
            : await market.leverage.estimateGas.createLoanApprove(userCollateral),
    }
  },
  validationSuite: borrowQueryValidationSuite,
  dependencies: (params) => [createLoanMaxReceiveKey(params)],
})

export const useCreateLoanEstimateGas = <ChainId extends IChainId>(
  networks: NetworkDict<ChainId>,
  query: GasEstimateParams<ChainId>,
  enabled?: boolean,
) => {
  const { chainId } = query
  const { data: estimate, isLoading: estimateLoading } = useCreateLoanApproveEstimateGas(query, enabled)
  const { data, isLoading: conversionLoading } = useEstimateGas<ChainId, typeof estimate>(
    networks,
    chainId,
    estimate,
    enabled,
  )
  return { data, isLoading: estimateLoading || conversionLoading }
}
