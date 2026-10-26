import type { ComponentProps } from 'react'
import { useConnection } from 'wagmi'
import { useWallet } from '@evm-ui/features/connect-wallet'
import { ChartStateWrapper } from '@ui/features/charts/ChartStateWrapper'
import type { ConnectionProps } from '@ui/features/connect-wallet/ConnectWalletButton'

export const EvmChartStateWrapper = (
  props: Omit<ComponentProps<typeof ChartStateWrapper>, 'userAddress' | keyof ConnectionProps>,
) => {
  const { address, isConnected, isConnecting } = useConnection()
  return (
    <ChartStateWrapper
      {...props}
      userAddress={address}
      connect={useWallet().connect}
      isConnected={isConnected}
      isConnecting={isConnecting}
    />
  )
}
