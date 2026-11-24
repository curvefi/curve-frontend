import type { ReactNode } from 'react'
import type { Address } from '@primitives/address.utils'
import { ErrorPage } from '@ui/features/errors/ErrorPage'
import type { QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

/** Undefined is unresolved; null means the requested resource is absent. */
export const PageState = ({
  query: { data, error },
  notFound,
  continueUrl,
  userAddress,
  children,
}: {
  query: QueryProp<unknown>
  notFound: string
  continueUrl: string
  userAddress: Address | undefined
  children: ReactNode
}) =>
  error || data === null ? (
    <ErrorPage
      title={(error && t`Error`) ?? '404'}
      subtitle={error?.message ?? notFound}
      error={error}
      continueUrl={continueUrl}
      userAddress={userAddress}
    />
  ) : (
    children
  )
