import type { ComponentProps } from 'react'
import { useConnection } from 'wagmi'
import { ChartStateWrapper } from '@evm-ui/shared/ui/Chart/ChartStateWrapper'

export const EvmChartStateWrapper = (props: Omit<ComponentProps<typeof ChartStateWrapper>, 'userAddress'>) => (
  <ChartStateWrapper {...props} userAddress={useConnection().address} />
)
