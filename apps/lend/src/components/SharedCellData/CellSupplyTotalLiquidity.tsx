import { formatNumber } from '@/ui/utils'
import React from 'react'

import useStore from '@/store/useStore'

const CellSupplyTotalLiquidity = ({ rChainId, rOwmId }: { rChainId: ChainId; rOwmId: string }) => {
  const resp = useStore((state) => state.markets.totalLiquidityMapper[rChainId]?.[rOwmId])

  const { totalLiquidity, error } = resp ?? {}

  return (
    <>
      {typeof resp === 'undefined'
        ? '-'
        : error
        ? '?'
        : formatNumber(totalLiquidity, { currency: 'USD', notation: 'compact' })}
    </>
  )
}

export default CellSupplyTotalLiquidity
