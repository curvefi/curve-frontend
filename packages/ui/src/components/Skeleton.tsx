// eslint-disable-next-line no-restricted-imports -- Implements the shared Skeleton.
import MuiSkeleton, { type SkeletonProps as MuiSkeletonProps } from '@mui/material/Skeleton'
import { PLACEHOLDER } from '@primitives/number.utils'
import { Sizing } from '@ui/features/themes/design/0_primitives'

type SkeletonPreset = Pick<MuiSkeletonProps, 'width' | 'height' | 'variant'>

/** Choose a category by the placeholder's role. Omitted dimensions follow the child or surrounding layout. */
const SKELETON_CATEGORIES = {
  'content.block': { variant: 'rectangular' },
  'content.fullWidth': { variant: 'rectangular', width: '100%' },
  'table.value': { width: Sizing[700] },
  'table.rewardIcon': { variant: 'circular', width: Sizing[200], height: Sizing[200] },
  'header.tokenIcon': { variant: 'circular', width: Sizing[500], height: Sizing[500] },
  'actionInfo.value': { width: `${PLACEHOLDER.toString().length}ch`, height: '1rem' },
} as const satisfies Record<string, SkeletonPreset>

export type SkeletonProps = Omit<MuiSkeletonProps, 'width' | 'height' | 'variant'> & {
  /** Omit to size the default text placeholder from its children. */
  category?: keyof typeof SKELETON_CATEGORIES
  width?: never
  height?: never
  variant?: never
}

export const Skeleton = ({ category, ...props }: SkeletonProps) => {
  const { variant, width, height }: SkeletonPreset = category ? SKELETON_CATEGORIES[category] : {}
  return <MuiSkeleton {...props} variant={variant} width={width} height={height} />
}
