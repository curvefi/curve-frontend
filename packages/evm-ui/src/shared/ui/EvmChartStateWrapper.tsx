import { useConnection } from 'wagmi'
import { useWallet } from '@evm-ui/features/connect-wallet'
import { pick } from '@primitives/objects.utils'
import { ChartStateWrapper, type ChartStateWrapperProps } from '@ui/features/charts/ChartStateWrapper'
import type { ConnectionProps } from '@ui/features/connect-wallet/ConnectWalletButton'

export const EvmChartStateWrapper = <T,>(
  props: Omit<ChartStateWrapperProps<T>, 'userAddress' | keyof ConnectionProps>,
) => {
  const connection = useConnection()
  return (
    <ChartStateWrapper
      {...props}
      {...pick(connection, 'isConnecting', 'isConnected')}
      userAddress={connection.address}
      connect={useWallet().connect}
    />
  )
}
