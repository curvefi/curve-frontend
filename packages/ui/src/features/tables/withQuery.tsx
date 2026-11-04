import type { ComponentType, ReactNode } from 'react'
import type { CellContext, RowData } from '@tanstack/react-table'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import type { QueryProp } from '@ui/features/queries/util'
import type { CurveTableFeatures } from './data-table.utils'
import { ErrorCell } from './ErrorCell'

// The skeleton is a block, so the cell's text alignment does not move it: the auto margin pushes it to the right
// TODO: delete this in the task to create skeleton categories
const skeletonProps = { width: 40, sx: { marginInlineStart: 'auto' } } as const

/** Skeleton until the query has data, error icon when it failed. Data already loaded stays visible after a failed refetch. */
const QueryCell = ({
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

/** A cell that waits on a query of its row, the cell itself only has to render the loaded value. */
export const withQuery =
  <TData extends RowData, TValue>(
    getQuery: (row: TData) => QueryProp<unknown>,
    Cell: ComponentType<CellContext<CurveTableFeatures, TData, TValue>>,
  ) =>
  (props: CellContext<CurveTableFeatures, TData, TValue>) => (
    <QueryCell query={getQuery(props.row.original)}>
      <Cell {...props} />
    </QueryCell>
  )
