import type { ComponentProps } from 'react'
import { useConnection } from 'wagmi'
import { ChartStateWrapper } from '@evm-ui/shared/ui/Chart/ChartStateWrapper'
import type { ConnectionProps } from '@ui/components/ConnectWalletButton'

type EvmChartStateWrapperProps = Omit<ComponentProps<typeof ChartStateWrapper>, 'userAddress' | keyof ConnectionProps>

export const EvmChartStateWrapper = (props: EvmChartStateWrapperProps) => (
  <ChartStateWrapper {...props} userAddress={useConnection().address} />
)
