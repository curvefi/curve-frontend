import React from 'react'

import { formatNumber } from '@ui/utils'
import useStore from '@/lend/store/useStore'

const CellLoanTotalDebt = ({ rChainId, rOwmId }: { rChainId: ChainId; rOwmId: string }) => {
  const resp = useStore((state) => state.markets.statsTotalsMapper[rChainId]?.[rOwmId])

  const { totalDebt, error } = resp || {}

  return <>{typeof resp === 'undefined' ? '-' : error ? '?' : formatNumber(totalDebt, { notation: 'compact' })}</>
}

export default CellLoanTotalDebt
