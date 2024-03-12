import type { ChipProps } from '@/ui/Typography/types'

import React from 'react'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import Chip from '@/ui/Typography/Chip'

const CellRate = ({
  rChainId,
  rOwmId,
  type,
  ...props
}: ChipProps & {
  rChainId: ChainId
  rOwmId: string
  type: 'borrow' | 'supply'
}) => {
  const resp = useStore((state) => state.markets.ratesMapper[rChainId]?.[rOwmId])

  const { rates, error } = resp ?? {}
  const rate = type === 'borrow' ? rates?.borrowApy : rates?.lendApy

  return (
    <>
      {typeof resp === 'undefined' ? null : error ? (
        '?'
      ) : (
        <Chip {...props}>{formatNumber(rate, FORMAT_OPTIONS.PERCENT)}</Chip>
      )}
    </>
  )
}

export default CellRate
