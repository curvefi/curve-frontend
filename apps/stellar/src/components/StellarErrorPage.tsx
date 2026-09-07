import type { ComponentProps } from 'react'
import { ErrorPage } from '@ui/features/errors/ErrorPage'

export const StellarErrorPage = (props: Omit<ComponentProps<typeof ErrorPage>, 'userAddress'>) => (
  <ErrorPage {...props} userAddress={undefined} /> // todo: add real address
)
