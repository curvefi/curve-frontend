import type { ChipProps } from '@/ui/Typography/types'

import React from 'react'

import { formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import Chip from '@/ui/Typography/Chip'

const CellSupplyTotalLiquidity = ({
  rChainId,
  rOwmId,
  ...props
}: ChipProps & {
  rChainId: ChainId
  rOwmId: string
}) => {
  const resp = useStore((state) => state.markets.totalLiquidityMapper[rChainId]?.[rOwmId])

  const { totalLiquidity, error } = resp ?? {}

  return (
    <>
      {typeof resp === 'undefined' ? null : error ? (
        '?'
      ) : (
        <Chip {...props}>
          {formatNumber(totalLiquidity, {
            currency: 'USD',
            notation: 'compact',
          })}
        </Chip>
      )}
    </>
  )
}

export default CellSupplyTotalLiquidity
