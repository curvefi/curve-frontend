import type { ChipProps } from '@/ui/Typography/types'

import React from 'react'

import { formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import Chip from '@/ui/Typography/Chip'
import { ChainId } from '@/types/lend.types'

const CellVaultPricePerShare = ({
  rChainId,
  rOwmId,
  type,
  ...props
}: ChipProps & {
  rChainId: ChainId
  rOwmId: string
  type: 'borrow' | 'supply'
}) => {
  const resp = useStore((state) => state.markets.vaultPricePerShare[rChainId]?.[rOwmId])

  const { pricePerShare, error } = resp ?? {}

  return (
    <>
      {typeof resp === 'undefined' ? null : error ? (
        '?'
      ) : (
        <Chip {...props}>{formatNumber(pricePerShare, { showAllFractionDigits: true })}</Chip>
      )}
    </>
  )
}

export default CellVaultPricePerShare
