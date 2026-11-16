import type { TransferProps } from '@/dex/components/PagePool/types'
import { alertTypeToSeverity } from '@/dex/utils/alert.utils'
import { SwapForm } from '@ui/features/pool-forms/swap/SwapForm'
import { useSwapForm } from '../hooks/useSwapForm'
import { SwapActionInfoList } from './SwapActionInfoList'

export const SwapTab = ({ maxSlippage, poolAlert }: TransferProps) => {
  const { params, fromSymbol, toSymbol, exchangeRate, ...props } = useSwapForm({ maxSlippage })
  return (
    <SwapForm
      {...props}
      {...(poolAlert?.isInformationOnlyAndShowInForm && {
        poolAlert: { severity: alertTypeToSeverity[poolAlert.alertType], message: poolAlert.message },
      })}
      footer={
        <SwapActionInfoList
          form={props.form}
          params={params}
          exchangeRate={exchangeRate}
          expectedOutput={props.expectedOutput}
          fromSymbol={fromSymbol}
          toSymbol={toSymbol}
        />
      }
    />
  )
}
