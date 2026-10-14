import { useState } from 'react'
import { useConnection } from 'wagmi'
import { useNetworkFromUrl } from '@/dex/hooks/useChainId'
import type { NetworkConfig } from '@/dex/types/main.types'
import { useWallet } from '@evm-ui/features/connect-wallet'
import { evmAddressDisplay, MAINNET_CRV } from '@evm-ui/utils'
import { ListPageLayout } from '@ui/features/layout/ListPageLayout'
import { PoolsTable } from '@ui/features/pool-list/PoolsTable'
import type { UserPositionsTableVariant } from '@ui/features/pool-list/types'
import { UserPositionsTable } from '@ui/features/pool-list/UserPositionsTable'
import { PoolExpandedPanelActions } from './components/PoolExpandedPanelActions'
import { usePoolsTable } from './hooks/usePoolsTable'
import { useResidualClaimsTable } from './hooks/useResidualClaimsTable'
import { useUserPositionsTable } from './hooks/useUserPositionsTable'

function usePositions(network: NetworkConfig) {
  const [variant, setVariant] = useState<UserPositionsTableVariant>('userPositions')
  const table = {
    residualClaims: {
      variant: 'residualClaims' as const,
      ...useResidualClaimsTable({ network }, variant === 'residualClaims'),
    },
    userPositions: {
      variant: 'userPositions' as const,
      ...useUserPositionsTable({ network }, variant === 'userPositions'),
    },
  }[variant]
  return { onVariantChange: setVariant, ...table }
}

function PoolLists({ network }: { network: NetworkConfig }) {
  const { address, isConnecting, isConnected } = useConnection()
  const { connect } = useWallet()
  const tableProps = {
    userAddress: address,
    isConnecting,
    isConnected,
    connect,
    addressDisplay: evmAddressDisplay,
    crvToken: MAINNET_CRV,
    Actions: PoolExpandedPanelActions,
  }
  return (
    <>
      <UserPositionsTable {...usePositions(network)} {...tableProps} />
      <PoolsTable {...usePoolsTable(network)} {...tableProps} />
    </>
  )
}

export const PoolListPage = () => {
  const network = useNetworkFromUrl()
  return <ListPageLayout>{network && <PoolLists network={network} />}</ListPageLayout>
}
