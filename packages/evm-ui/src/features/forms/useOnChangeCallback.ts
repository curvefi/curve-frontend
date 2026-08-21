import { useEffect, useEffectEvent } from 'react'

export function useOnChangeCallback(value: unknown, resetQuery: () => Promise<void | void[]>) {
  const effect = useEffectEvent(resetQuery)
  useEffect(() => (value ? void effect() : undefined), [value])
}
