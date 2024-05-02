import React from 'react'

import { formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import Spinner from '@/ui/Spinner'

const ComboBoxTokenUserBalance = ({ tokenAddress }: { tokenAddress: string }) => {
  const userBalancesMapper = useStore((state) => state.userBalances.userBalancesMapper)
  const value = userBalancesMapper[tokenAddress]

  return <span>{typeof value === 'undefined' ? <Spinner size={15} /> : formatNumber(value)}</span>
}

export default ComboBoxTokenUserBalance
