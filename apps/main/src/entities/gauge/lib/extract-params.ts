import { extractQueryParams } from '@/shared/lib/queries/extract-params'
import type { QueryKey } from '@tanstack/react-query'

export function extractGaugeParams<T extends QueryKey>(queryKey: T, skipCount = 4) {
  return extractQueryParams(queryKey, skipCount)
}
