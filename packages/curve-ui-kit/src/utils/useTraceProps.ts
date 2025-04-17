import { useEffect, useRef } from 'react'

/**
 * A hook used for debugging purposes to log the changes in the props of a component.
 * Even if left unused when committed, it's useful to leave it in the codebase for future debugging.
 * @see https://stackoverflow.com/a/51082563
 *
 * Usage:
 * ```tsx
 * import { useTraceProps } from '@ui-kit/utils/useTraceProps'
 *
 * const MyComponent = ({ prop1, prop2, prop3 }) => {
 *   useEffect(() => {
 *      // Your component logic
 *   }, [prop1, prop2])
 *   useTraceProps('MyComponent.useEffect', { prop1, prop2 })
 *   // ...
 * }
 */
// noinspection JSUnusedGlobalSymbols
export function useTraceProps<T extends Record<string, unknown>>(name: string, props: T) {
  const propsRef = useRef<T>(props)
  useEffect(() => {
    const { current: previousProps } = propsRef
    const changedProps: Record<string, [unknown, unknown]> = Object.fromEntries(
      Object.keys(props)
        .map((key) => [key, [previousProps[key], props[key]]])
        .filter(([, [prev, curr]]) => prev !== curr),
    )
    if (Object.keys(changedProps).length) {
      console.info(
        `useTraceUpdate ${name} ${new Date().toISOString()}: Changed props`,
        Object.entries(changedProps).map(([key, [prev, curr]]) => `${key}: ${toString(prev)} -> ${toString(curr)}`),
      )
    }
    propsRef.current = props
  }, [props, name])
  useEffect(
    () => () => console.warn(`useTraceProps ${name} ${new Date().toISOString()}: Unmounted`, propsRef.current),
    [name],
  )
}

const toString = (value: unknown) => {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return value?.toString() // circular objects cannot be converted to JSON
  }
}
