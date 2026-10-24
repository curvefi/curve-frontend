import { useConnection } from 'wagmi'
import { ChartStateWrapper, type ChartStateWrapperProps } from '@evm-ui/shared/ui/Chart/ChartStateWrapper'

export const EvmChartStateWrapper = <T,>(props: Omit<ChartStateWrapperProps<T>, 'userAddress'>) => (
  <ChartStateWrapper {...props} userAddress={useConnection().address} />
)
