import type { ComponentProps } from 'react'
import { useConnection } from 'wagmi'
import { ErrorMessage } from '@evm-ui/shared/ui/ErrorMessage'

export const EvmErrorMessage = (props: Omit<ComponentProps<typeof ErrorMessage>, 'userAddress'>) => (
  <ErrorMessage {...props} userAddress={useConnection().address} />
)
