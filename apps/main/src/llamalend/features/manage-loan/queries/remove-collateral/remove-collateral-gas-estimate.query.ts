import { useMemo } from 'react'
import { ethAddress } from 'viem'
import { getLlamaMarket } from '@/llamalend/llama.utils'
import { type NetworkDict } from '@/llamalend/llamalend.types'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { calculateGas, useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import type { CollateralQuery } from '../manage-loan.types'
import { collateralValidationSuite } from '../manage-loan.validation'
import { maxRemovableCollateralKey } from './remove-collateral-max-removable.query'

type RemoveCollateralGasQuery<T = IChainId> = CollateralQuery<T>
type RemoveCollateralGasParams<T = IChainId> = FieldsOf<RemoveCollateralGasQuery<T>>

const { useQuery: useRemoveCollateralGasEstimate } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userCollateral }: RemoveCollateralGasParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'remove-collateral-gas-estimation',
      { userCollateral },
    ] as const,
  queryFn: async ({ marketId, userCollateral }: RemoveCollateralGasQuery) => {
    const market = getLlamaMarket(marketId)
    return {
      removeCollateral: await market.removeCollateralEstimateGas(userCollateral),
    }
  },
  validationSuite: collateralValidationSuite,
  dependencies: (params) => [maxRemovableCollateralKey(params)],
})

export const useRemoveCollateralEstimateGas = <ChainId extends IChainId>(
  networks: NetworkDict<ChainId>,
  query: RemoveCollateralGasParams<ChainId>,
  enabled?: boolean,
) => {
  const { chainId } = query
  const network = chainId && networks[chainId]
  const { data: ethRate, isLoading: ethRateLoading } = useTokenUsdRate({ chainId, tokenAddress: ethAddress }, enabled)
  const { data: gasInfo, isLoading: gasInfoLoading } = useGasInfoAndUpdateLib<ChainId>({ chainId, networks }, enabled)
  const { data: estimate, isLoading: estimateLoading } = useRemoveCollateralGasEstimate(query, enabled)
  const data = useMemo(
    () =>
      !estimate || !network
        ? {}
        : { removeCollateral: calculateGas(estimate.removeCollateral, gasInfo, ethRate, network) },
    [estimate, network, gasInfo, ethRate],
  )
  return { data, isLoading: ethRateLoading || gasInfoLoading || estimateLoading }
}
