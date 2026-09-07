import type { ComponentProps } from 'react'
import { useConnection } from 'wagmi'
import { ErrorMessage } from '@ui/features/errors/ErrorMessage'

export const EvmErrorMessage = (props: Omit<ComponentProps<typeof ErrorMessage>, 'userAddress'>) => (
  <ErrorMessage {...props} userAddress={useConnection().address} />
)
