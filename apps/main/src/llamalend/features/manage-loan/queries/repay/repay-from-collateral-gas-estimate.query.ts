import { useMemo } from 'react'
import { ethAddress } from 'viem'
import { getLlamaMarket } from '@/llamalend/llama.utils'
import { type NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import { type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { calculateGas, useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import type { RepayFromCollateralQuery } from '../manage-loan.types'
import { repayFromCollateralValidationSuite } from '../manage-loan.validation'

type RepayFromCollateralGasQuery<T = IChainId> = RepayFromCollateralQuery<T>
type RepayFromCollateralGasParams<T = IChainId> = FieldsOf<RepayFromCollateralGasQuery<T>>

const { useQuery: useRepayFromCollateralGasEstimate } = queryFactory({
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
    return {
      repayFromCollateral:
        market instanceof LendMarketTemplate
          ? await market.leverage.estimateGas.repay(stateCollateral, userCollateral, userBorrowed)
          : market.leverageV2.hasLeverage()
            ? await market.leverageV2.estimateGas.repay(stateCollateral, userCollateral, userBorrowed)
            : await market.deleverage.estimateGas.repay(userCollateral),
    }
  },
  validationSuite: repayFromCollateralValidationSuite,
})

export const useRepayFromCollateralEstimateGas = <ChainId extends IChainId>(
  networks: NetworkDict<ChainId>,
  query: RepayFromCollateralGasParams<ChainId>,
  enabled?: boolean,
) => {
  const { chainId } = query
  const network = chainId && networks[chainId]
  const { data: ethRate, isLoading: ethRateLoading } = useTokenUsdRate({ chainId, tokenAddress: ethAddress }, enabled)
  const { data: gasInfo, isLoading: gasInfoLoading } = useGasInfoAndUpdateLib<ChainId>({ chainId, networks }, enabled)
  const { data: estimate, isLoading: estimateLoading } = useRepayFromCollateralGasEstimate(query, enabled)
  const data = useMemo(
    () =>
      !estimate || !network
        ? {}
        : { repayFromCollateral: calculateGas(estimate.repayFromCollateral, gasInfo, ethRate, network) },
    [estimate, network, gasInfo, ethRate],
  )
  return { data, isLoading: ethRateLoading || gasInfoLoading || estimateLoading }
}
