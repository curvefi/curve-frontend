import { useState } from 'react'
import { useConnection } from 'wagmi'
import type { NetworkConfig } from '@/dex/types/main.types'
import { useWallet } from '@evm-ui/features/connect-wallet'
import { evmAddressDisplay, MAINNET_CRV } from '@evm-ui/utils'
import type { PoolRow, UserPositionsTableVariant } from '@ui/features/pool-list/types'
import { UserPositionsTable as UserPositionsTableUi } from '@ui/features/pool-list/UserPositionsTable'
import type { ExpandedPanelComponent } from '@ui/features/tables/ExpansionRow'
import { useResidualClaimsTable } from './hooks/useResidualClaimsTable'
import { useUserPositionsTable } from './hooks/useUserPositionsTable'

export const UserPositionsTable = ({
  network,
  Actions,
}: {
  network: NetworkConfig
  Actions: ExpandedPanelComponent<PoolRow>
}) => {
  const { address, isConnecting, isConnected } = useConnection()
  const { connect } = useWallet()
  const [variant, setVariant] = useState<UserPositionsTableVariant>('userPositions')
  const userPositions = useUserPositionsTable({ network }, variant === 'userPositions')
  const residualClaims = useResidualClaimsTable({ network }, variant === 'residualClaims')

  return (
    <UserPositionsTableUi
      {...(variant === 'residualClaims' ? { variant, ...residualClaims } : { variant, ...userPositions })}
      userAddress={address}
      isConnecting={isConnecting}
      isConnected={isConnected}
      connect={connect}
      onVariantChange={setVariant}
      addressDisplay={evmAddressDisplay}
      crvToken={{ address: MAINNET_CRV.address, blockchainId: MAINNET_CRV.chain }}
      Actions={Actions}
    />
  )
}
