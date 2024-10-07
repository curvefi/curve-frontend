import { formatNumber } from '@/ui/utils'
import React from 'react'

import useStore from '@/store/useStore'

const CellLoanTotalDebt = ({ rChainId, rOwmId }: { rChainId: ChainId; rOwmId: string }) => {
  const resp = useStore((state) => state.markets.statsTotalsMapper[rChainId]?.[rOwmId])

  const { totalDebt, error } = resp || {}

  return <>{typeof resp === 'undefined' ? '-' : error ? '?' : formatNumber(totalDebt, { notation: 'compact' })}</>
}

export default CellLoanTotalDebt
