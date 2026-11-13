import type { TransferProps } from '@/dex/components/PagePool/types'
import { SwapForm } from '@ui/features/pool-forms/swap/SwapForm'
import { useSwapForm } from '../hooks/useSwapForm'
import { SwapActionInfoList } from './SwapActionInfoList'

export const SwapTab = ({ maxSlippage }: TransferProps) => {
  const { params, fromSymbol, toSymbol, ...props } = useSwapForm({ maxSlippage })
  return (
    <SwapForm
      {...props}
      footer={
        <SwapActionInfoList
          form={props.form}
          params={params}
          inputAmount={props.inputAmount}
          expectedOutput={props.expectedOutput}
          fromSymbol={fromSymbol}
          toSymbol={toSymbol}
        />
      }
    />
  )
}
