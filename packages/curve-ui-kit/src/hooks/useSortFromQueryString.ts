import { useLocation, useNavigate } from 'react-router'
import { useCallback, useMemo } from 'react'
import { SortingState, OnChangeFn } from '@tanstack/react-table'

export function useSortFromQueryString(defaultSort: SortingState) {
  const { search } = useLocation()
  const navigate = useNavigate()
  const sort = useMemo(() => parseSort(search, defaultSort), [defaultSort, search])
  const onChange: OnChangeFn<SortingState> = useCallback(
    (newSort) => navigate({ search: updateSort(search, typeof newSort == 'function' ? newSort(sort) : newSort) }),
    [navigate, search, sort],
  )
  return [sort, onChange] as const
}

function parseSort(search: string, defaultSort: SortingState) {
  const sort = new URLSearchParams(search)
    .getAll('sort')
    .map((id) => (id.startsWith('-') ? { id: id.slice(1), desc: true } : { id, desc: false }))
  return sort.length ? sort : defaultSort.map(({ id, desc }) => ({ id: id.replace(/\./g, '_'), desc }))
}

export function updateSort(search: string, state: SortingState): string {
  const params = new URLSearchParams(search)
  params.delete('sort')
  state.forEach(({ id, desc }) => params.append('sort', `${desc ? '-' : ''}${id}`))
  console.log(search, state, params.toString())
  return `?${params.toString()}`
}
