import { type ComponentProps, type ReactNode, lazy, Suspense } from 'react'
import Skeleton from '@mui/material/Skeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { MinHeight } = SizesAndSpaces

type SkeletonHeight = ComponentProps<typeof Skeleton>['height']
type RouteFnComponent<TProps extends object = object> = (props: TProps) => ReactNode
type LazyModule<TProps extends object = object> = { default: RouteFnComponent<TProps> }
type ExtractRouteFnComponent<TValue> = TValue extends (props: infer TProps) => ReactNode
  ? TProps extends object
    ? RouteFnComponent<TProps>
    : never
  : never

export const lazyRouteComponent = <TProps extends object>(
  importer: () => Promise<LazyModule<TProps>>,
  fallbackHeight: SkeletonHeight = MinHeight.pageContent,
  fallback?: ReactNode,
): RouteFnComponent<TProps> => {
  const LazyComponent = lazy(importer)
  const LazyRouteComponent = (props: TProps) => (
    <Suspense fallback={fallback ?? <Skeleton width="100%" height={fallbackHeight} />}>
      <LazyComponent {...props} />
    </Suspense>
  )
  LazyRouteComponent.displayName = 'LazyRouteComponent'
  return LazyRouteComponent
}

export const lazyNamedRouteComponent = <TModule extends Record<string, unknown>, TExportName extends keyof TModule>(
  importer: () => Promise<TModule>,
  exportName: TExportName,
  fallbackHeight?: SkeletonHeight,
  fallback?: ReactNode,
): ExtractRouteFnComponent<TModule[TExportName]> =>
  lazyRouteComponent<object>(
    async () => ({
      default: (await importer())[exportName] as RouteFnComponent<object>,
    }),
    fallbackHeight,
    fallback,
  ) as ExtractRouteFnComponent<TModule[TExportName]>
