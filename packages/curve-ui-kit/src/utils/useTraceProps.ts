'use client'
import { useEffect, useRef } from 'react'

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
  useEffect(() => {
    console.info(`useTraceProps ${name} ${new Date().toISOString()}: Mounted`, propsRef.current)
    return () => console.warn(`useTraceProps ${name} ${new Date().toISOString()}: Unmounted`, propsRef.current)
  }, [name])
}

const toString = (value: unknown) => {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return value?.toString() // circular objects cannot be converted to JSON
  }
}
