import { useQuoteQueries } from '@/stellar/features/swap/useQuoteQueries'
import { useGasEstimation } from '@/stellar/lib/gas'
import { useSwapSimulation } from '@/stellar/queries/swap/swap-simulation.query'
import { maybe } from '@primitives/objects.utils'
import { PoolActionInfoList } from '@ui/features/pool-forms/PoolActionInfoList'
import { calculateMinimumReceived } from '@ui/features/pool-forms/swap/swap.utils'
import { combineQueries } from '@ui/features/queries/combine'
import { mapQuery } from '@ui/features/queries/util'
import { decimalDiv } from '@ui/lib/decimal'
import type { SwapFormQuery } from './types'

type SwapActionInfoListProps = SwapFormQuery & { fromSymbol: string | undefined; toSymbol: string | undefined }

export const SwapActionInfoList = (params: SwapActionInfoListProps) => {
  const { inputAmount, outputAmount } = useQuoteQueries(params)
  const { fromSymbol, slippage, toSymbol, toIndex, decimals } = params
  const minimum = mapQuery(outputAmount, value =>
    maybe(decimals?.[toIndex], precision => calculateMinimumReceived(value, slippage, precision)),
  )
  const simulation = useSwapSimulation({ ...params, inputAmount: inputAmount.data, minimum: minimum.data })

  return (
    <PoolActionInfoList
      exchangeRate={combineQueries([inputAmount, outputAmount], (input, output) => decimalDiv(output, input))}
      minimumReceived={minimum}
      gas={useGasEstimation(params, simulation)}
      fromSymbol={fromSymbol}
      toSymbol={toSymbol}
    />
  )
}
