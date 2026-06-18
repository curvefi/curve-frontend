import { useCallback, useMemo } from 'react'
import type { V2PoolFilterType as PoolType } from '@curvefi/prices-api/pools'
import { maybe, notFalsy, recordValues } from '@primitives/objects.utils'
import { useSearchParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import type { PoolListQueryUpdater } from './usePoolListPagination'

const POOL_TYPE_QUERY_FIELD = 'filter'
const SEARCH_QUERY_FIELD = 'search'

// Omitted "main" and "factory" from available filters.
const POOL_TYPE_FILTERS = [
  { key: 'stableswapng', label: t`Stable NG` },
  { key: 'crvusd', label: t`crvUSD` },
  { key: 'crypto', label: t`Twocrypto` },
  { key: 'factory_tricrypto', label: t`Tricrypto` },
] satisfies { key: PoolType; label: string }[]

export type PoolListPoolType = (typeof POOL_TYPE_FILTERS)[number]['key']
export type PoolListFilter = (typeof POOL_TYPE_FILTERS)[number]

const POOL_TYPES = POOL_TYPE_FILTERS.map(({ key }) => key)
const POOL_TYPE_SET = new Set<string>(POOL_TYPES)

// The API bundles crypto, factory_crypto, and twocryptong pools under the "crypto" filter.
const CRYPTO_POOL_TYPE_ALIASES = new Set<string>(['factory_crypto', 'twocryptong'])

const DEFAULT_FILTER_QUERY = { [SEARCH_QUERY_FIELD]: null, [POOL_TYPE_QUERY_FIELD]: null }

const isPoolType = (value: string | null): value is PoolListPoolType => value != null && POOL_TYPE_SET.has(value)

export const getPoolTypeFromQuery = (value: string | null): PoolListPoolType | undefined =>
  maybe(value, value => (CRYPTO_POOL_TYPE_ALIASES.has(value) ? 'crypto' : isPoolType(value) ? value : undefined))

/**
 * Pool list filters are prices API query params, not TanStack column filters.
 * `useFilters` would serialize column/global filter state, while this table needs
 * `search_string`, `pool_type`, API alias normalization, and page reset behavior.
 */
export const usePoolListFilters = (updateQueryAndResetPage: PoolListQueryUpdater) => {
  const searchParams = useSearchParams()
  const searchText = searchParams.get(SEARCH_QUERY_FIELD) ?? ''
  const poolType = getPoolTypeFromQuery(searchParams.get(POOL_TYPE_QUERY_FIELD))
  const activeFilters = useMemo(
    () => ({
      [SEARCH_QUERY_FIELD]: searchText,
      [POOL_TYPE_QUERY_FIELD]: poolType,
    }),
    [poolType, searchText],
  )

  const onSearch = useCallback(
    (value: string) => updateQueryAndResetPage({ [SEARCH_QUERY_FIELD]: value || null }),
    [updateQueryAndResetPage],
  )
  const setPoolType = useCallback(
    (value: PoolListPoolType | null) => updateQueryAndResetPage({ [POOL_TYPE_QUERY_FIELD]: value }),
    [updateQueryAndResetPage],
  )
  const resetFilters = useCallback(() => updateQueryAndResetPage(DEFAULT_FILTER_QUERY), [updateQueryAndResetPage])
  const activeFilterCount = notFalsy(...recordValues(activeFilters)).length

  return {
    activeFilterCount,
    onSearch,
    poolType,
    poolTypeFilters: POOL_TYPE_FILTERS,
    resetFilters,
    searchText,
    setPoolType,
  }
}
