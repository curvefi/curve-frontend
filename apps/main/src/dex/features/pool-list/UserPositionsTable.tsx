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

  return (
    <UserPositionsTableUi
      {...{
        residualClaims: {
          variant: 'residualClaims' as const,
          ...useResidualClaimsTable({ network }, variant === 'residualClaims'),
        },
        userPositions: {
          variant: 'userPositions' as const,
          ...useUserPositionsTable({ network }, variant === 'userPositions'),
        },
      }[variant]}
      userAddress={address}
      isConnecting={isConnecting}
      isConnected={isConnected}
      connect={connect}
      onVariantChange={setVariant}
      addressDisplay={evmAddressDisplay}
      crvToken={MAINNET_CRV}
      Actions={Actions}
    />
  )
}
