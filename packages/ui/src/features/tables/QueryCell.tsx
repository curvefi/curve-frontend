import type { ReactNode } from 'react'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import type { QueryProp } from '@ui/features/queries/util'
import { ErrorCell } from './ErrorCell'

// The skeleton is a block, so the cell's text alignment does not move it: the auto margin pushes it to the right
// TODO: delete this in the task to create skeleton categories
const skeletonProps = { width: 40, sx: { marginInlineStart: 'auto' } } as const

/** Skeleton until the query has data, error icon when it failed. Data already loaded stays visible after a failed refetch. */
export const QueryCell = ({
  query: { data, isLoading, error },
  children,
}: {
  query: QueryProp<unknown>
  children: ReactNode
}) =>
  error && data == null ? (
    <ErrorCell error={error} />
  ) : (
    <WithSkeleton loading={isLoading && data == null} {...skeletonProps}>
      {children}
    </WithSkeleton>
  )
