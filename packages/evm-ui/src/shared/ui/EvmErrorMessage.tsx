import type { ComponentProps } from 'react'
import { useConnection } from 'wagmi'
import { ErrorMessage } from '@evm-ui/shared/ui/ErrorMessage'
import type { ConnectionProps } from '@ui/components/ConnectWalletButton'

export const EvmErrorMessage = (
  props: Omit<ComponentProps<typeof ErrorMessage>, 'userAddress' | keyof ConnectionProps>,
) => <ErrorMessage {...props} userAddress={useConnection().address} />
