import { ReactNode } from 'react'

type WithWrapperProps<Props> = Props & {
  /** Whether wrapper should be applied */
  wrap: boolean
  /** Component to use as a wrapper */
  Wrapper: (props: Props & { children: ReactNode }) => ReactNode
  /** Children to be wrapped */
  children: ReactNode
}

/**
 * A component that wraps children with a given Wrapper component when `wrap` is true.
 * Useful for conditionally applying a wrapper component based on a boolean prop.
 */
export const WithWrapper = <Props,>({ wrap, Wrapper, children, ...wrapperProps }: WithWrapperProps<Props>) =>
  wrap ? <Wrapper {...(wrapperProps as Props)}>{children}</Wrapper> : children
