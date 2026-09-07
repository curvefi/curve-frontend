import type { ComponentProps } from 'react'
import { useConnection } from 'wagmi'
import { ErrorBoundary } from '@evm-ui/widgets/ErrorBoundary'
import type { ConnectionProps } from '@ui/components/ConnectWalletButton'

export const EvmErrorBoundary = (
  props: Omit<ComponentProps<typeof ErrorBoundary>, 'userAddress' | keyof ConnectionProps>,
) => <ErrorBoundary {...props} userAddress={useConnection().address} />
