import { ReadonlyURLSearchParams } from 'next/dist/client/components/navigation.react-server'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { OnChangeFn, SortingState } from '@tanstack/react-table'

export function useSortFromQueryString(defaultSort: SortingState) {
  const search = useSearchParams()
  const { push } = useRouter()
  const sort = useMemo(() => parseSort(search, defaultSort), [defaultSort, search])
  const onChange: OnChangeFn<SortingState> = useCallback(
    (newSort) => push(updateSort(search, typeof newSort == 'function' ? newSort(sort) : newSort)),
    [push, search, sort],
  )
  return [sort, onChange] as const
}

function parseSort(search: ReadonlyURLSearchParams | null, defaultSort: SortingState) {
  const sort = search
    ?.getAll('sort')
    .map((id) => (id.startsWith('-') ? { id: id.slice(1), desc: true } : { id, desc: false }))
  return sort?.length ? sort : defaultSort.map(({ id, desc }) => ({ id: id.replace(/\./g, '_'), desc }))
}

export function updateSort(search: ReadonlyURLSearchParams | null, state: SortingState): string {
  const params = new URLSearchParams(search ?? [])
  params.delete('sort')
  state.forEach(({ id, desc }) => params.append('sort', `${desc ? '-' : ''}${id}`))
  return `?${params.toString()}`
}
