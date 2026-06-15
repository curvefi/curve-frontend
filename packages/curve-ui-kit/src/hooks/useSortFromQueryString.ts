import { useCallback, useMemo } from 'react'
import type { OnChangeFn, SortingState } from '@tanstack/react-table'
import { useSearchNavigate, useSearchParams } from '@ui-kit/hooks/router'

type UseSortFromQueryStringOptions = {
  fieldName?: string
  resetPageField?: string
  normalizeSort?: (sorting: SortingState) => SortingState
}

export function useSortFromQueryString(
  defaultSort: SortingState,
  fieldNameOrOptions: string | UseSortFromQueryStringOptions = 'sort',
) {
  const {
    fieldName = 'sort',
    resetPageField,
    normalizeSort,
  } = typeof fieldNameOrOptions === 'string' ? { fieldName: fieldNameOrOptions } : fieldNameOrOptions
  const searchParams = useSearchParams()
  const searchNavigate = useSearchNavigate(searchParams)
  const sort = useMemo(() => {
    const parsedSort = parseSort(searchParams, defaultSort, fieldName)

    return normalizeSort ? normalizeSort(parsedSort) : parsedSort
  }, [defaultSort, fieldName, normalizeSort, searchParams])
  const onChange: OnChangeFn<SortingState> = useCallback(
    newSort => {
      const sorting = typeof newSort == 'function' ? newSort(sort) : newSort
      const nextSort = normalizeSort ? normalizeSort(sorting) : sorting

      searchNavigate(
        {
          [fieldName]: nextSort.map(({ id, desc }) => `${desc ? '-' : ''}${id}`),
          ...(resetPageField && { [resetPageField]: null }),
        },
        { replace: true },
      )
    },
    [fieldName, normalizeSort, resetPageField, searchNavigate, sort],
  )
  return [sort, onChange] as const
}

function parseSort(search: URLSearchParams, defaultSort: SortingState, fieldName: string) {
  const sort = search
    .getAll(fieldName)
    .map(id => (id.startsWith('-') ? { id: id.slice(1), desc: true } : { id, desc: false }))
  return sort?.length ? sort : defaultSort.map(({ id, desc }) => ({ id: id.replace(/\./g, '_'), desc }))
}
