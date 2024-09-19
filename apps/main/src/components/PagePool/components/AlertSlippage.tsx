import React, { useMemo } from 'react'

import { usePoolContext } from '@/components/PagePool/contextPool'

import AlertSlippageComp from '@/components/AlertSlippage'

type Props = {
  expected: string | undefined
  virtualPrice: string | undefined
}

const AlertSlippage: React.FC<Props> = ({ expected, virtualPrice }) => {
  const { maxSlippage } = usePoolContext()

  const estLpTokenReceivedUsdAmount = useMemo(() => {
    if (!expected || !virtualPrice) return ''

    const usdAmount = Number(expected) * Number(virtualPrice)
    return usdAmount.toString()
  }, [expected, virtualPrice])

  return <AlertSlippageComp maxSlippage={maxSlippage} usdAmount={estLpTokenReceivedUsdAmount} />
}

export default AlertSlippage
