import React, { ReactNode } from 'react'
import { default as Skeleton, SkeletonProps } from '@mui/material/Skeleton'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'

type WithSkeletonProps = {
  /** Whether to show the skeleton or the children */
  loading: boolean
  /** Content to render when not loading, also used for skeleton dimension inference */
  children: ReactNode
} & SkeletonProps

/**
 * A component that wraps children with a Skeleton when loading.
 * Useful for when you want to use the same child for dimension inference.
 */
export const WithSkeleton = ({ loading, ...skeletonProps }: WithSkeletonProps) => (
  <WithWrapper Wrapper={Skeleton} shouldWrap={loading} {...skeletonProps} />
)
