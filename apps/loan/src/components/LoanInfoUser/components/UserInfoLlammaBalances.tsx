import React from 'react'

import { formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import Box from '@/ui/Box'
import InpChipUsdRate from '@/components/InpChipUsdRate'
import ListInfoItem from '@/ui/ListInfo'
import { Llamma } from '@/types/loan.types'

const UserInfoLlammaBalances = ({ llammaId, llamma }: { llammaId: string; llamma: Llamma | null }) => {
  const userState = useStore((state) => state.loans.userDetailsMapper[llammaId]?.userState)

  const {
    coins: [stablecoin, collateral],
    coinAddresses: [stablecoinAddress, collateralAddress],
  } = llamma ?? { coins: [], coinAddresses: [] }

  return (
    <Box flex gridGap={3}>
      <ListInfoItem title={collateral}>
        <Box grid>
          {formatNumber(userState?.collateral, { defaultValue: '-' })}
          <InpChipUsdRate hideRate address={collateralAddress} amount={userState?.collateral} />
        </Box>
      </ListInfoItem>
      <ListInfoItem title={stablecoin}>
        <Box grid>
          {formatNumber(userState?.stablecoin, { defaultValue: '' })}
          <InpChipUsdRate hideRate address={stablecoinAddress} amount={userState?.stablecoin} />
        </Box>
      </ListInfoItem>
    </Box>
  )
}

export default UserInfoLlammaBalances
