import { TrustlineButtons } from '@/stellar/features/trustline/TrustlineButtons'
import type { PoolQuery } from '@/stellar/queries/root-keys'
import { SwapForm } from '@ui/features/pool-forms/swap/SwapForm'
import { SwapActionInfoList } from './SwapActionInfoList'
import { useSwapForm } from './useSwapForm'

export const SwapTab = (params: PoolQuery) => {
  const { params: queryParams, fromSymbol, toSymbol, onSlippageChange, trustlineTokens, ...form } = useSwapForm(params)
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
    >
      <TrustlineButtons network={params.network} tokens={trustlineTokens} />
    </SwapForm>
  )
}
