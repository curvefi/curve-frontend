import type { ComponentProps } from 'react'
import { useConnection } from 'wagmi'
import { useWallet } from '@evm-ui/features/connect-wallet'
import { ErrorMessage } from '@evm-ui/shared/ui/ErrorMessage'
import type { ConnectionProps } from '@ui/components/ConnectWalletButton'

export const EvmErrorMessage = (
  props: Omit<ComponentProps<typeof ErrorMessage>, 'userAddress' | keyof ConnectionProps>,
) => {
  const { isConnected, isConnecting, address } = useConnection()
  const { connect } = useWallet()
  return (
    <ErrorMessage
      {...props}
      userAddress={address}
      isConnected={isConnected}
      isConnecting={isConnecting}
      connect={connect}
    />
  )
}
