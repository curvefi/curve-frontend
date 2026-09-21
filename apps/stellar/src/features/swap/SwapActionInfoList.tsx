import { useQuoteQueries } from '@/stellar/features/swap/useQuoteQueries'
import { useGasEstimation } from '@/stellar/lib/gas'
import { useSwapSimulation } from '@/stellar/queries/swap/swap-simulation.query'
import { maybe } from '@primitives/objects.utils'
import { PoolActionInfoList } from '@ui/features/pool-forms/PoolActionInfoList'
import { calculateMinimumReceived } from '@ui/features/pool-forms/swap/swap.utils'
import { mapQuery } from '@ui/features/queries/util'
import type { SwapFormQuery } from './types'

type SwapActionInfoListProps = SwapFormQuery & { toSymbol: string | undefined }

export const SwapActionInfoList = (params: SwapActionInfoListProps) => {
  const { inputAmount, outputAmount } = useQuoteQueries(params)
  const { slippage, toSymbol, toIndex, decimals } = params
  const minimum = mapQuery(outputAmount, value =>
    maybe(decimals?.[toIndex], precision => calculateMinimumReceived(value, slippage, precision)),
  )
  const simulation = useSwapSimulation({ ...params, inputAmount: inputAmount.data, minimum: minimum.data })

  return <PoolActionInfoList minimumReceived={minimum} gas={useGasEstimation(params, simulation)} toSymbol={toSymbol} />
}
