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
import { stringNumber, Zero } from '@ui-kit/utils'
import type { BorrowFormQuery } from '../types'
import { maxBorrowReceiveKey } from './borrow-max-receive.query'
import { borrowQueryValidationSuite } from './borrow.validation'

type BorrowGasEstimateQuery<T = IChainId> = BorrowFormQuery<T>
type GasEstimateParams<T = IChainId> = FieldsOf<BorrowGasEstimateQuery<T>>

const { useQuery: useGasEstimate } = queryFactory({
  queryKey: ({ chainId, poolId, userBorrowed = Zero, userCollateral = Zero, leverageEnabled }: GasEstimateParams) =>
    [
      ...rootKeys.pool({ chainId, poolId }),
      'borrow-gas-estimation',
      { userBorrowed },
      { userCollateral },
      { leverageEnabled },
    ] as const,
  queryFn: async ({ poolId, userBorrowed = Zero, userCollateral = Zero, leverageEnabled }: BorrowGasEstimateQuery) => {
    const market = getLlamaMarket(poolId)
    const [collateral, borrowed] = [userCollateral, userBorrowed].map(stringNumber)
    return {
      createLoanApprove: !leverageEnabled
        ? await market.estimateGas.createLoanApprove(collateral)
        : market instanceof LendMarketTemplate
          ? await market.leverage.estimateGas.createLoanApprove(collateral, borrowed)
          : market.leverageV2.hasLeverage()
            ? await market.leverageV2.estimateGas.createLoanApprove(collateral, borrowed)
            : await market.leverage.estimateGas.createLoanApprove(collateral),
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
