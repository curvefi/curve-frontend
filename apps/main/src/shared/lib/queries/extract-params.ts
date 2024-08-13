import type { QueryKey } from '@tanstack/react-query'

export function extractQueryParams<T extends QueryKey>(queryKey: T, skipCount: number): T[number][] {
  return queryKey.slice(skipCount)
}
