import { ReactNode } from 'react'
import { Skeleton, type SkeletonProps } from '@ui/components/Skeleton'
import { WithWrapper } from '@ui/components/WithWrapper'
import type { QueryProp } from '@ui/features/queries/util'

type WithSkeletonProps = {
  /** Content to render when not loading, also used for skeleton dimension inference */
  children: ReactNode
} & SkeletonProps &
  ({ loading: boolean; query?: never } | { loading?: never; query: QueryProp<unknown> })

/**
 * A component that wraps children with a Skeleton when loading.
 * Useful for when you want to use the same child for dimension inference.
 * A query with nullish data renders only while loading.
 *
 * Uses `component="div"` instead of MUI Skeleton's default `span` to avoid
 * invalid HTML nesting when children render as block-level elements (e.g. h4, p).
 */
export const WithSkeleton = ({ loading, query, component = 'div', ...skeletonProps }: WithSkeletonProps) => {
  const isLoading = loading ?? query?.isLoading
  if (query && !isLoading && query.data == null) return null

  return <WithWrapper Wrapper={Skeleton} shouldWrap={isLoading} component={component} {...skeletonProps} />
}
