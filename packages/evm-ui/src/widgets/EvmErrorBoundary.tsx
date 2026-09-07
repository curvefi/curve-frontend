import type { ComponentProps } from 'react'
import { useConnection } from 'wagmi'
import type { ConnectionProps } from '@ui/components/ConnectWalletButton'
import { ErrorBoundary } from '@ui/features/errors/ErrorBoundary'

export const EvmErrorBoundary = (
  props: Omit<ComponentProps<typeof ErrorBoundary>, 'userAddress' | keyof ConnectionProps>,
) => <ErrorBoundary {...props} userAddress={useConnection().address} />
