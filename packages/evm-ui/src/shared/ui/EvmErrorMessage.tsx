import type { ComponentProps } from 'react'
import { useConnection } from 'wagmi'
import type { ConnectionProps } from '@ui/components/ConnectWalletButton'
import { ErrorMessage } from '@ui/features/errors/ErrorMessage'

export const EvmErrorMessage = (
  props: Omit<ComponentProps<typeof ErrorMessage>, 'userAddress' | keyof ConnectionProps>,
) => <ErrorMessage {...props} userAddress={useConnection().address} />
