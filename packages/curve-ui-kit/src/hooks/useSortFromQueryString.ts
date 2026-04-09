import { useCallback, useMemo } from 'react'
import { OnChangeFn, SortingState } from '@tanstack/react-table'
import { useSearchNavigate, useSearchParams } from '@ui-kit/hooks/router'

export function useSortFromQueryString(defaultSort: SortingState, fieldName = 'sort') {
  const searchParams = useSearchParams()
  const searchNavigate = useSearchNavigate(searchParams)
  const sort = useMemo(() => parseSort(searchParams, defaultSort, fieldName), [defaultSort, fieldName, searchParams])
  const onChange: OnChangeFn<SortingState> = useCallback(
    (newSort) =>
      searchNavigate(
        {
          [fieldName]: (typeof newSort == 'function' ? newSort(sort) : newSort).map(
            ({ id, desc }) => `${desc ? '-' : ''}${id}`,
          ),
        },
        { replace: true },
      ),
    [fieldName, searchNavigate, sort],
  )
  return [sort, onChange] as const
}

function parseSort(search: URLSearchParams, defaultSort: SortingState, fieldName: string) {
  const sort = search
    .getAll(fieldName)
    .map((id) => (id.startsWith('-') ? { id: id.slice(1), desc: true } : { id, desc: false }))
  return sort?.length ? sort : defaultSort.map(({ id, desc }) => ({ id: id.replace(/\./g, '_'), desc }))
}
