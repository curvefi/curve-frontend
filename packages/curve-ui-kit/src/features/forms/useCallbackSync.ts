import { useEffect } from 'react'
import { maybe } from '@primitives/objects.utils'
import type { Query } from '@ui-kit/types/util'

/**
 * Syncs `data` to `callback` whenever it changes to a valid value. Clears it when unmounting.
 */
export function useCallbackSync<T>({ data }: Query<T | null>, callback: (data: T | undefined) => void): void {
  useEffect(() => maybe(data, data => callback(data)), [callback, data]) // keep parent in sync, keep stale while revalidating
  useEffect(() => () => callback(undefined), [callback]) // clear stale data only when unmounting
}
