import { useCallback, useMemo } from 'react'
import { OnChangeFn, SortingState } from '@tanstack/react-table'
import { useSearchParams } from '@ui-kit/hooks/router'

export function useSortFromQueryString(defaultSort: SortingState, fieldName = 'sort') {
  const searchParams = useSearchParams()
  const sort = useMemo(() => parseSort(searchParams, defaultSort, fieldName), [defaultSort, fieldName, searchParams])
  const onChange: OnChangeFn<SortingState> = useCallback(
    (newSort) => {
      // avoid using next `push` because it will cause navigation and SSR refetch
      const pathname = updateSort(searchParams, typeof newSort == 'function' ? newSort(sort) : newSort, fieldName)
      window.history.pushState(null, '', pathname)
    },
    [searchParams, sort, fieldName],
  )
  return [sort, onChange] as const
}

function parseSort(search: URLSearchParams | null, defaultSort: SortingState, fieldName: string) {
  const sort = search
    ?.getAll(fieldName)
    .map((id) => (id.startsWith('-') ? { id: id.slice(1), desc: true } : { id, desc: false }))
  return sort?.length ? sort : defaultSort.map(({ id, desc }) => ({ id: id.replace(/\./g, '_'), desc }))
}

function updateSort(search: URLSearchParams | null, state: SortingState, fieldName: string): string {
  const params = new URLSearchParams(search ?? [])
  params.delete(fieldName)
  state.forEach(({ id, desc }) => params.append('sort', `${desc ? '-' : ''}${id}`))
  return `?${params.toString()}`
}
