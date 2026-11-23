import { asAddress } from '@/stellar/features/connect-wallet/address'
import { useQuoteQueries } from '@/stellar/features/swap/useQuoteQueries'
import { useGasEstimation } from '@/stellar/lib/gas'
import { useSwapSimulation } from '@/stellar/queries/swap/swap-simulation.query'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { PoolActionInfoList } from '@ui/features/pool-forms/PoolActionInfoList'
import { calculateMinimumReceived } from '@ui/features/pool-forms/swap/swap.utils'
import { mapQuery } from '@ui/features/queries/util'
import type { SwapFormQuery } from './types'
import { useSwapPriceImpact } from './useSwapPriceImpact'

type SwapActionInfoListProps = SwapFormQuery & {
  fromSymbol: string | undefined
  toSymbol: string | undefined
  onSlippageChange: (slippage: Decimal) => void
}

export const SwapActionInfoList = ({ onSlippageChange, ...params }: SwapActionInfoListProps) => {
  const { inputAmount, expectedOutput, exchangeRate } = useQuoteQueries(params)
  const { fromSymbol, account, slippage, toSymbol, toIndex, decimals } = params
  const minimum = mapQuery(expectedOutput, value =>
    maybe(decimals?.[toIndex], precision => calculateMinimumReceived(value, slippage, precision)),
  )
  const simulation = useSwapSimulation({ ...params, inputAmount, expectedOutput })

  return (
    <PoolActionInfoList
      slippageType="stable"
      exchangeRate={exchangeRate}
      minimumReceived={minimum}
      priceImpact={useSwapPriceImpact({ ...params, inputAmount: inputAmount.data }, expectedOutput)}
      gas={useGasEstimation(params, simulation)}
      slippage={slippage}
      onSlippageChange={onSlippageChange}
      userAddress={asAddress(account)}
      fromSymbol={fromSymbol}
      toSymbol={toSymbol}
    />
  )
}
