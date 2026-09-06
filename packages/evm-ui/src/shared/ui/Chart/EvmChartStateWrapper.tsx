import type { ComponentProps } from 'react'
import { useConnection } from 'wagmi'
import { useWallet } from '@evm-ui/features/connect-wallet'
import { ChartStateWrapper } from '@evm-ui/shared/ui/Chart/ChartStateWrapper'
import type { ConnectionProps } from '@ui/components/ConnectWalletButton'

type EvmChartStateWrapperProps = Omit<ComponentProps<typeof ChartStateWrapper>, 'userAddress' | keyof ConnectionProps>

export const EvmChartStateWrapper = (props: EvmChartStateWrapperProps) => {
  const { isConnected, isConnecting, address } = useConnection()
  const { connect } = useWallet()
  return (
    <ChartStateWrapper
      {...props}
      userAddress={address}
      isConnected={isConnected}
      isConnecting={isConnecting}
      connect={connect}
    />
  )
}
