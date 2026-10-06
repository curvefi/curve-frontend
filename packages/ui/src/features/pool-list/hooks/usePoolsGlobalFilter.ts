import type { FuseOptionKey } from 'fuse.js'
import { notFalsy } from '@primitives/objects.utils'
import { cleanValue, useFuzzyFilterFn } from '@ui/hooks/useFuzzySearch'
import type { PoolRow } from '../types'

const POOL_SEARCH_KEYS = [
  'name',
  { name: 'symbols', getFn: ({ coins }) => cleanValue(coins.map(({ symbol }) => symbol)) },
  {
    name: 'addresses',
    getFn: ({ address, gauge, gauges, coins }) => [
      ...new Set([
        address,
        ...notFalsy(gauge?.address),
        ...gauges.map(({ address }) => address),
        ...coins.map(({ address }) => address),
      ]),
    ],
  },
] satisfies FuseOptionKey<PoolRow>[]

/** Client-side search filter for the new pools list. */
export const usePoolsGlobalFilterFn = (data: readonly PoolRow[], filterValue: string) =>
  useFuzzyFilterFn(data, filterValue, POOL_SEARCH_KEYS)
