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

/**
 * Returns the functions to estimate gas for approving and creating a loan based on the market type and leverage.
 */
const getEstimateGasMethods = (poolId: string, leverage: number | undefined) => {
  const [market, type] = getLlamaMarket(poolId)
  const parent = !leverage
    ? market
    : type === LlamaMarketType.Lend
      ? market.leverage
      : market.leverageV2.hasLeverage()
        ? market.leverageV2
        : market.leverage
  return {
    estimateGasApprove: parent.estimateGas.createLoanApprove.bind(parent.estimateGas),
    estimateGasLoan: parent.estimateGas.createLoan.bind(parent.estimateGas),
  }
}

const { useQuery: useGasEstimate } = queryFactory({
  queryKey: ({
    chainId,
    poolId,
    userBorrowed = 0,
    userCollateral = 0,
    debt = 0,
    leverage,
    range,
    slippage,
  }: GasEstimateParams) =>
    [
      ...rootKeys.pool({ chainId, poolId }),
      'borrow-gas-estimation',
      { userBorrowed },
      { userCollateral },
      { debt },
      { leverage },
      { range },
      { slippage },
    ] as const,
  queryFn: async ({
    poolId,
    userBorrowed = 0,
    userCollateral = 0,
    debt = 0,
    leverage,
    range,
    slippage,
  }: BorrowGasEstimateQuery) => {
    const { estimateGasApprove, estimateGasLoan } = getEstimateGasMethods(poolId, leverage)
    const [createLoanApprove, createLoan] = await Promise.all([
      estimateGasApprove(userCollateral, userBorrowed),
      estimateGasLoan(userCollateral, userBorrowed, debt, range, slippage),
    ])
    const total = Array.isArray(createLoanApprove)
      ? createLoanApprove.map((approve, i) => approve + (createLoan as number[])[i])
      : createLoanApprove + (createLoan as number)
    return { createLoanApprove, createLoan, total }
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
    () => (!estimate || !network ? {} : { totalCost: calculateGas(estimate.total, gasInfo, ethRate, network) }),
    [estimate, network, gasInfo, ethRate],
  )
  return { data, isLoading: ethRateLoading || gasInfoLoading || estimateLoading }
}
