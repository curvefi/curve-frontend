import type { PoolQuery } from '@/stellar/queries/root-keys'
import { SwapForm } from '@ui/features/pool-forms/swap/SwapForm'
import { SwapActionInfoList } from './SwapActionInfoList'
import { useSwapForm } from './useSwapForm'

export const SwapTab = (params: PoolQuery) => {
  const { params: queryParams, fromSymbol, toSymbol, onSlippageChange, ...form } = useSwapForm(params)
  return (
    <SwapForm
      {...form}
      footer={
        <SwapActionInfoList
          {...queryParams}
          fromSymbol={fromSymbol}
          toSymbol={toSymbol}
          onSlippageChange={onSlippageChange}
        />
      }
    />
  )
}
