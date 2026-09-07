import type { ComponentProps } from 'react'
import { useConnection, WagmiProviderNotFoundError } from 'wagmi'
import { ErrorPage } from '@ui/features/errors/ErrorPage'

/*** Returns the connected wallet address when wagmi context is available. */
const useTryConnection = () => {
  try {
    return useConnection()
  } catch (error) {
    // Error boundaries can render before the WagmiProvider mounts. In that case, wagmi throws WagmiProviderNotFoundError,
    // which we swallow so the modal can still render and users can submit reports without a prefilled address.
    if (error instanceof WagmiProviderNotFoundError) return
    throw error
  }
}

export const EvmErrorPage = (props: Omit<ComponentProps<typeof ErrorPage>, 'userAddress'>) => (
  <ErrorPage {...props} userAddress={useTryConnection()?.address} />
)
