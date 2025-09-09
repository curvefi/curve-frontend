import { useMemo } from 'react'
import { ethAddress } from 'viem'
import { type NetworkDict } from '@/llamalend/llamalend.types'
import { maxBorrowReceiveKey } from '@/llamalend/widgets/borrow/queries/borrow-max-receive.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { type FieldsOf } from '@ui-kit/lib'
import { queryFactory, rootKeys } from '@ui-kit/lib/model'
import { calculateGas, useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'
import { useTokenUsdRate } from '@ui-kit/lib/model/entities/token-usd-rate'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { BorrowFormQuery } from '../borrow.types'
import { getLlamaMarket } from '../llama.util'
import { borrowQueryValidationSuite } from './borrow.validation'

type BorrowGasEstimateQuery<T = IChainId> = BorrowFormQuery<T>
type GasEstimateParams<T = IChainId> = FieldsOf<BorrowGasEstimateQuery<T>>

const { useQuery: useGasEstimate } = queryFactory({
  queryKey: ({ chainId, poolId, userBorrowed = 0, userCollateral = 0, leverage }: GasEstimateParams) =>
    [
      ...rootKeys.pool({ chainId, poolId }),
      'borrow-gas-estimation',
      { userBorrowed },
      { userCollateral },
      { leverage },
    ] as const,
  queryFn: async ({ poolId, userBorrowed = 0, userCollateral = 0, leverage }: BorrowGasEstimateQuery) => {
    const [market, type] = getLlamaMarket(poolId)
    return {
      createLoanApprove: !leverage
        ? await market.estimateGas.createLoanApprove(userCollateral)
        : type === LlamaMarketType.Lend
          ? await market.leverage.estimateGas.createLoanApprove(userCollateral, userBorrowed)
          : market.leverageV2.hasLeverage()
            ? await market.leverageV2.estimateGas.createLoanApprove(userCollateral, userBorrowed)
            : await market.leverage.estimateGas.createLoanApprove(userCollateral),
    }
  },
  validationSuite: borrowQueryValidationSuite,
  dependencies: (params) => [maxBorrowReceiveKey(params)],
})

export const useBorrowEstimateGas = <ChainId extends IChainId>(
  networks: NetworkDict<ChainId>,
  query: GasEstimateParams<ChainId>,
  enabled?: boolean,
) => {
  const { chainId } = query
  const network = chainId && networks[chainId]
  const { data: ethRate, isLoading: ethRateLoading } = useTokenUsdRate({ chainId, tokenAddress: ethAddress }, enabled)
  const { data: gasInfo, isLoading: gasInfoLoading } = useGasInfoAndUpdateLib<ChainId>({ chainId, networks }, enabled)
  const { data: estimate, isLoading: estimateLoading } = useGasEstimate(query, enabled)
  const data = useMemo(
    () =>
      !estimate || !network
        ? {}
        : { createLoanApprove: calculateGas(estimate.createLoanApprove, gasInfo, ethRate, network) },
    [estimate, network, gasInfo, ethRate],
  )
  return { data, isLoading: ethRateLoading || gasInfoLoading || estimateLoading }
}
