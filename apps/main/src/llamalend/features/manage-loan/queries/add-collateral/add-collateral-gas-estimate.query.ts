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

type AddCollateralGasQuery<T = IChainId> = CollateralQuery<T>
type AddCollateralGasParams<T = IChainId> = FieldsOf<AddCollateralGasQuery<T>>

const { useQuery: useAddCollateralGasEstimate } = queryFactory({
  queryKey: ({ chainId, marketId, userAddress, userCollateral }: AddCollateralGasParams) =>
    [
      ...rootKeys.userMarket({ chainId, marketId, userAddress }),
      'add-collateral-gas-estimation',
      { userCollateral },
    ] as const,
  queryFn: async ({ marketId, userCollateral }: AddCollateralGasQuery) => {
    const market = getLlamaMarket(marketId)
    return {
      addCollateralApprove: await market.estimateGas.addCollateralApprove(userCollateral),
    }
  },
  validationSuite: collateralValidationSuite,
})

export const useAddCollateralEstimateGas = <ChainId extends IChainId>(
  networks: NetworkDict<ChainId>,
  query: AddCollateralGasParams<ChainId>,
  enabled?: boolean,
) => {
  const { chainId } = query
  const network = chainId && networks[chainId]
  const { data: ethRate, isLoading: ethRateLoading } = useTokenUsdRate({ chainId, tokenAddress: ethAddress }, enabled)
  const { data: gasInfo, isLoading: gasInfoLoading } = useGasInfoAndUpdateLib<ChainId>({ chainId, networks }, enabled)
  const { data: estimate, isLoading: estimateLoading } = useAddCollateralGasEstimate(query, enabled)
  const data = useMemo(
    () =>
      !estimate || !network
        ? {}
        : { addCollateralApprove: calculateGas(estimate.addCollateralApprove, gasInfo, ethRate, network) },
    [estimate, network, gasInfo, ethRate],
  )
  return { data, isLoading: ethRateLoading || gasInfoLoading || estimateLoading }
}
