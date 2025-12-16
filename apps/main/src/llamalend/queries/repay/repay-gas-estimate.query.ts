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
    const market = getLlamaMarket(marketId)
    if (isFull) {
      return market instanceof LendMarketTemplate
        ? await market.estimateGas.fullRepay(userAddress)
        : await market.fullRepayEstimateGas(userAddress)
    }
    if (market instanceof LendMarketTemplate) {
      return await market.leverage.estimateGas.repay(stateCollateral, userCollateral, userBorrowed)
    }
    if (market.leverageV2.hasLeverage()) {
      return await market.leverageV2.estimateGas.repay(stateCollateral, userCollateral, userBorrowed)
    }
    return await market.deleverage.estimateGas.repay(userCollateral)
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
