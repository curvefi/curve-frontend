import { useConnection } from 'wagmi'
import { useWallet } from '@evm-ui/features/connect-wallet'
import { ChartStateWrapper, type ChartStateWrapperProps } from '@evm-ui/shared/ui/Chart/ChartStateWrapper'
import type { ConnectionProps } from '@ui/features/connect-wallet/ConnectWalletButton'

export const EvmChartStateWrapper = <T,>(
  props: Omit<ChartStateWrapperProps<T>, 'userAddress' | keyof ConnectionProps>,
) => {
  const { address, isConnected, isConnecting } = useConnection()
  return (
    <ChartStateWrapper
      {...props}
      userAddress={address}
      isConnected={isConnected}
      isConnecting={isConnecting}
      connect={useWallet().connect}
    />
  )
}
