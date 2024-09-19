import React, { useMemo } from 'react'

import { usePoolContext } from '@/components/PagePool/contextPool'
import { useWithdrawContext } from '@/components/PagePool/Withdraw/contextWithdraw'
import useStore from '@/store/useStore'

import AlertSlippageComp from '@/components/AlertSlippage'

const AlertSlippage = () => {
  const { maxSlippage } = usePoolContext()
  const { formValues } = useWithdrawContext()

  const usdRatesMapper = useStore((state) => state.usdRates.usdRatesMapper)

  const { amounts, selected } = formValues

  // usd amount for slippage warning
  const estUsdAmountTotalReceive = useMemo(() => {
    if (selected === 'one-coin') {
      const foundCoinWithAmount = amounts.find((a) => Number(a.value) > 0)

      if (foundCoinWithAmount && !usdRatesMapper[foundCoinWithAmount.tokenAddress]) {
        const { value, tokenAddress } = foundCoinWithAmount
        const usdRate = usdRatesMapper[tokenAddress]
        if (usdRate && !isNaN(usdRate)) {
          return (Number(usdRate) * Number(value)).toString()
        }
      }
    }

    if (selected === 'balanced' || selected.startsWith('custom')) {
      let usdAmountTotal = 0

      amounts
        .filter((a) => Number(a.value) > 0)
        .forEach((a) => {
          const usdRate = usdRatesMapper[a.tokenAddress]
          if (usdRate && !isNaN(usdRate)) {
            usdAmountTotal += Number(a.value) * Number(usdRate)
          }
        })
      return usdAmountTotal.toString()
    }

    return ''
  }, [amounts, selected, usdRatesMapper])

  return <AlertSlippageComp maxSlippage={maxSlippage} usdAmount={estUsdAmountTotalReceive} />
}

export default AlertSlippage
