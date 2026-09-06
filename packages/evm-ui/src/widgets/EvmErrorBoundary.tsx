import type { ComponentProps } from 'react'
import { useConnection } from 'wagmi'
import { useWallet } from '@evm-ui/features/connect-wallet'
import { ErrorBoundary } from '@evm-ui/widgets/ErrorBoundary'
import type { ConnectionProps } from '@ui/components/ConnectWalletButton'

export const EvmErrorBoundary = (
  props: Omit<ComponentProps<typeof ErrorBoundary>, 'userAddress' | keyof ConnectionProps>,
) => {
  const { isConnected, isConnecting, address } = useConnection()
  const { connect } = useWallet()
  return (
    <ErrorBoundary
      {...props}
      userAddress={address}
      isConnected={isConnected}
      isConnecting={isConnecting}
      connect={connect}
    />
  )
}
