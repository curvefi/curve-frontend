import React from 'react'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

const CellBorrowRate = ({
  rChainId,
  rOwmId,
  defaultValue,
}: {
  rChainId: ChainId
  rOwmId: string
  defaultValue?: string
}) => {
  const resp = useStore((state) => state.markets.ratesMapper[rChainId]?.[rOwmId])

  const { rates, error } = resp ?? {}

  if (typeof resp === 'undefined') {
    return <>{defaultValue ?? '-'}</>
  }

  if (error) {
    return <>?</>
  }

  return formatNumber(rates?.borrowApy, { ...FORMAT_OPTIONS.PERCENT, defaultValue })
}

export default CellBorrowRate
