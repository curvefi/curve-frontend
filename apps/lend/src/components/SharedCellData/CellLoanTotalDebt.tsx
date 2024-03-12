import type { ChipProps } from '@/ui/Typography/types'

import React from 'react'

import { formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import Chip from '@/ui/Typography/Chip'

const CellLoanTotalDebt = ({
  rChainId,
  rOwmId,
  ...props
}: ChipProps & {
  rChainId: ChainId
  rOwmId: string
}) => {
  const resp = useStore((state) => state.markets.statsTotalsMapper[rChainId]?.[rOwmId])

  const { totalDebt, error } = resp || {}

  return (
    <>
      {typeof resp === 'undefined' ? null : error ? (
        '?'
      ) : (
        <Chip {...props}>{formatNumber(totalDebt, { notation: 'compact' })}</Chip>
      )}
    </>
  )
}

export default CellLoanTotalDebt
