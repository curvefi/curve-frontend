

import Box from '@/ui/Box'
import Spinner from '@/ui/Spinner'
import TextCaption from '@/ui/TextCaption'
import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import React from 'react'
import useStore from '@/store/useStore'

const ComboBoxTokenUserBalance = ({ tokenAddress }: { tokenAddress: string }) => {
  const userBalancesMapper = useStore((state) => state.userBalances.userBalancesMapper)
  const usdRatesMapper = useStore((state) => state.usdRates.usdRatesMapper)
  const userBalance = userBalancesMapper[tokenAddress]
  const userBalanceUsdRate = usdRatesMapper[tokenAddress]
  const userBalanceUsd = +(userBalance ?? '0') * +(userBalanceUsdRate ?? '0')

  return (
    <>
      {typeof userBalance === 'undefined' ? (
        <Spinner size={15} />
      ) : (
        <Box flex flexDirection="column" flexAlignItems="flex-end">
          <div>{formatNumber(userBalance)}</div>
          {userBalanceUsd > 0 ? <TextCaption>{formatNumber(userBalanceUsd, FORMAT_OPTIONS.USD)}</TextCaption> : null}
        </Box>
      )}
    </>
  )
}

export default ComboBoxTokenUserBalance
