import { useEstimateGas } from '@/llamalend/hooks/useEstimateGas'
import { getLlamaMarket } from '@/llamalend/llama.utils'
import { type NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import type { RepayFromCollateralQuery } from '../validation/manage-loan.types'
import { repayFromCollateralValidationSuite } from '../validation/manage-loan.validation'

type RepayFromCollateralGasQuery<T = IChainId> = RepayFromCollateralQuery<T>
type RepayFromCollateralGasParams<T = IChainId> = FieldsOf<RepayFromCollateralGasQuery<T>>

const { useQuery: useRepayGasEstimate } = queryFactory({
  queryKey: ({
    chainId,
    marketId,
    stateCollateral = '0',
    userCollateral = '0',
    userBorrowed = '0',
    userAddress,
  }: RepayFromCollateralGasParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'repay-from-collateral-gas-estimation',
      { stateCollateral },
      { userCollateral },
      { userBorrowed },
    ] as const,
  queryFn: async ({ marketId, stateCollateral, userCollateral, userBorrowed }: RepayFromCollateralGasQuery) => {
    const market = getLlamaMarket(marketId)
    return market instanceof LendMarketTemplate
      ? await market.leverage.estimateGas.repay(stateCollateral, userCollateral, userBorrowed)
      : market.leverageV2.hasLeverage()
        ? await market.leverageV2.estimateGas.repay(stateCollateral, userCollateral, userBorrowed)
        : await market.deleverage.estimateGas.repay(userCollateral)
  },
  validationSuite: repayFromCollateralValidationSuite,
})

export const useRepayEstimateGas = <ChainId extends IChainId>(
  networks: NetworkDict<ChainId>,
  query: RepayFromCollateralGasParams<ChainId>,
  enabled?: boolean,
) => {
  const { chainId } = query
  const { data: estimate, isLoading: estimateLoading, error: estimateError } = useRepayGasEstimate(query, enabled)
  const {
    data,
    isLoading: conversionLoading,
    error: conversionError,
  } = useEstimateGas<ChainId>(networks, chainId, estimate, enabled)
  return { data, isLoading: estimateLoading || conversionLoading, error: estimateError ?? conversionError }
}
