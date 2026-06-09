import { useEffect } from 'react'
import type { Query } from '@ui-kit/types/util'

/**
 * Syncs `data` to `callback` whenever it changes to a resolved value. Keeps the previous value while loading, and
 * clears it when the query explicitly resolves to null or unmounts.
 */
export function useCallbackSync<T>({ data }: Query<T | null>, callback: (data: T | undefined) => void): void {
  useEffect(() => {
    // Keep parent in sync with resolved values, keep stale while revalidating, and clear resolved empty data.
    if (data !== undefined) callback(data ?? undefined)
  }, [callback, data])
  useEffect(() => () => callback(undefined), [callback]) // clear stale data only when unmounting
}
