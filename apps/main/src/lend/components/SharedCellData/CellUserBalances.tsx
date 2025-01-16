import type { ChipProps } from '@/ui/Typography/types'

import React from 'react'

import { formatNumber } from '@/ui/utils'
import useStore from '@/lend/store/useStore'

import Chip from '@/ui/Typography/Chip'

const CellUserBalances = ({
  userActiveKey,
  type,
  ...props
}: ChipProps & {
  userActiveKey: string
  type: 'borrow' | 'supply'
}) => {
  const resp = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])

  const { collateral, borrowed, error } = resp ?? {}
  const balance = type === 'borrow' ? collateral : borrowed

  return (
    <>
      {typeof resp === 'undefined' ? null : error ? (
        '?'
      ) : (
        <Chip {...props}>{formatNumber(balance, { showDecimalIfSmallNumberOnly: true, defaultValue: '-' })}</Chip>
      )}
    </>
  )
}

export default CellUserBalances
