import type { PoolQuery } from '@/stellar/queries/root-keys'
import { SwapForm } from '@ui/features/pool-forms/swap/SwapForm'
import { SwapInfoList } from '@ui/features/pool-forms/swap/SwapInfoList'
import { useSwapForm } from './useSwapForm'

export const SwapTab = (params: PoolQuery) => {
  const {
    params: { slippage, fromIndex, toIndex },
    preview,
    tokens,
    userAddress,
    ...form
  } = useSwapForm(params)
  const { inputAmount, outputAmount, priceImpact } = preview
  const [fromSymbol, toSymbol] = [fromIndex, toIndex].map(index => tokens.data?.[index]?.symbol)
  return (
    <SwapForm
      {...form}
      tokens={tokens}
      userAddress={userAddress}
      inputAmount={inputAmount}
      outputAmount={outputAmount}
      priceImpact={priceImpact}
      footer={
        <SwapInfoList
          {...preview}
          fromSymbol={fromSymbol}
          toSymbol={toSymbol}
          slippage={slippage}
          userAddress={userAddress}
        />
      }
    />
  )
}
