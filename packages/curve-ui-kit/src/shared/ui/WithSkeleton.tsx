import React from 'react'
import { Skeleton, SkeletonProps } from '@mui/material'

/**
 * A component that wraps children with a Skeleton when loading.
 * Useful for when you want to use the same child for dimension inference.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <WithSkeleton loading={isLoading}>
 *   <Typography>Content to show when loaded</Typography>
 * </WithSkeleton>
 *
 * // With metrics
 * <WithSkeleton loading={isDataLoading}>
 *   <Metric
 *     label="Total Value"
 *     value={totalValue}
 *     unit="$"
 *   />
 * </WithSkeleton>
 *
 * // With custom skeleton props
 * <WithSkeleton loading={isLoading} variant="rectangular" width={200} height={40}>
 *   <Typography>Content to show when loaded</Typography>
 * </WithSkeleton>
 * ```
 */
type WithSkeletonProps = {
  /** Whether to show the skeleton or the children */
  loading: boolean
  /** Content to render when not loading, also used for skeleton dimension inference */
  children: React.ReactNode
} & SkeletonProps

export const WithSkeleton = ({ loading, children, ...skeletonProps }: WithSkeletonProps) =>
  loading ? <Skeleton {...skeletonProps}>{children}</Skeleton> : <>{children}</>
