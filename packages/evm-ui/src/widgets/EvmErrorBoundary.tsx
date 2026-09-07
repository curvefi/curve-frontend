import type { ComponentProps } from 'react'
import { useConnection } from 'wagmi'
import { ErrorBoundary } from '@evm-ui/widgets/ErrorBoundary'

export const EvmErrorBoundary = (props: Omit<ComponentProps<typeof ErrorBoundary>, 'userAddress'>) => (
  <ErrorBoundary {...props} userAddress={useConnection().address} />
)
