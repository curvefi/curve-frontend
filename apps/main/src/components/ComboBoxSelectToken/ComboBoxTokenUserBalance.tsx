import React from 'react'
import isUndefined from 'lodash/isUndefined'

import { formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import Spinner from '@/ui/Spinner'

const ComboBoxTokenUserBalance = ({
  haveSigner,
  tokenAddress,
}: {
  haveSigner: boolean | undefined
  tokenAddress: string
}) => {
  const userBalancesMapper = useStore((state) => state.userBalances.userBalancesMapper)
  const value = userBalancesMapper[tokenAddress]

  return <span>{haveSigner ? isUndefined(value) ? <Spinner size={15} /> : formatNumber(value) : null}</span>
}

export default ComboBoxTokenUserBalance
