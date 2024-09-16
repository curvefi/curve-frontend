import { useEffect, useRef } from 'react'

export function useTraceUpdate<T extends Record<string, unknown>>(name: string, props: T) {
  const propsRef = useRef<T>(props)
  // noinspection CallerJS
  useEffect(() => {
    const { current } = propsRef
    const changedProps = Object.fromEntries(
      Object.entries(props).filter(([key, value]) => current[key] !== value)
        .map(([key, value]) => [key, [current[key], value]]))
    if (Object.keys(changedProps).length) {
      console.info(
        `useTraceUpdate ${name} ${new Date().toISOString()}: Changed props`,
        JSON.stringify(changedProps, null, 2)
      )
    }
    propsRef.current = props
  }, [props, name])
  useEffect(() => {
    return () => {
      console.warn(`useTraceUpdate ${name} ${new Date().toISOString()}: Unmounted`, propsRef.current)
    }
  }, [name])
}