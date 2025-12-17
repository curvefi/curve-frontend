import { useEstimateGas } from '@/llamalend/hooks/useEstimateGas'
import { getLlamaMarket } from '@/llamalend/llama.utils'
import { type NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { RepayHealthQuery } from '../validation/manage-loan.types'
import { repayFromCollateralIsFullValidationSuite } from '../validation/manage-loan.validation'
import { repayIsFullQueryKey } from './repay-is-full.query'
import { getRepayImplementation } from './repay-query.helpers'

type RepayFromCollateralGasQuery<T = IChainId> = RepayHealthQuery<T>
type RepayFromCollateralGasParams<T = IChainId> = FieldsOf<RepayFromCollateralGasQuery<T>>

const { useQuery: useRepayGasEstimate } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
    isFull,
  }: RepayFromCollateralGasParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repay-from-collateral-gas-estimation',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
      { isFull },
    ] as const,
  queryFn: async ({
    marketId,
    stateCollateral,
    userCollateral,
    userBorrowed,
    isFull,
    userAddress,
  }: RepayFromCollateralGasQuery) => {
    if (isFull) {
      const market = getLlamaMarket(marketId)
      return market instanceof LendMarketTemplate
        ? await market.estimateGas.fullRepay(userAddress)
        : await market.fullRepayEstimateGas(userAddress)
    }
    const [type, impl, args] = getRepayImplementation(marketId, { userCollateral, stateCollateral, userBorrowed })
    switch (type) {
      case 'V1':
      case 'V2':
        return await impl.estimateGas.repay(...args)
      case 'deleverage':
        return await impl.estimateGas.repay(...args)
      case 'unleveraged':
        return await impl.estimateGas.repay(...args)
    }
  },
  validationSuite: repayFromCollateralIsFullValidationSuite,
  dependencies: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
  }) => [repayIsFullQueryKey({ chainId, marketId, stateCollateral, userCollateral, userBorrowed, userAddress })],
})

export const useRepayEstimateGas = <ChainId extends IChainId>(
  networks: NetworkDict<ChainId>,
  query: RepayFromCollateralGasParams<ChainId>,
  enabled?: boolean,
) => {
  const { chainId } = query
  const { data: estimate, isLoading: estimateLoading, error: estimateError } = useRepayGasEstimate(query, enabled)
  const {
    data = null,
    isLoading: conversionLoading,
    error: conversionError,
  } = useEstimateGas<ChainId>(networks, chainId, estimate, enabled)
  return { data, isLoading: estimateLoading || conversionLoading, error: estimateError ?? conversionError }
}
