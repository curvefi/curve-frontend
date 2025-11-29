import { useCallback, useMemo } from 'react'
import { OnChangeFn, SortingState } from '@tanstack/react-table'
import { useNavigate, useSearchParams } from '@ui-kit/hooks/router'

export function useSortFromQueryString(defaultSort: SortingState, fieldName = 'sort') {
  const searchParams = useSearchParams()
  const sort = useMemo(() => parseSort(searchParams, defaultSort, fieldName), [defaultSort, fieldName, searchParams])
  const navigate = useNavigate()
  const onChange: OnChangeFn<SortingState> = useCallback(
    (newSort) => navigate(updateSort(searchParams, typeof newSort == 'function' ? newSort(sort) : newSort, fieldName)),
    [navigate, searchParams, sort, fieldName],
  )
  return [sort, onChange] as const
}

function parseSort(search: URLSearchParams, defaultSort: SortingState, fieldName: string) {
  const sort = search
    .getAll(fieldName)
    .map((id) => (id.startsWith('-') ? { id: id.slice(1), desc: true } : { id, desc: false }))
  return sort?.length ? sort : defaultSort.map(({ id, desc }) => ({ id: id.replace(/\./g, '_'), desc }))
}

function updateSort(search: URLSearchParams, state: SortingState, fieldName: string): string {
  const params = new URLSearchParams(search)
  params.delete(fieldName)
  state.forEach(({ id, desc }) => params.append(fieldName, `${desc ? '-' : ''}${id}`))
  return `?${params.toString()}`
}
