import { useCallback, useMemo } from 'react'
import { OnChangeFn, SortingState } from '@tanstack/react-table'
import { useSearchNavigate, useSearchParams } from '@ui/hooks/router'

type SortFromQueryStringOptions = {
  /** Query string key holding the sort */
  fieldName?: string
  /** When provided, sort entries with other column ids (e.g. removed columns) are ignored */
  sortableIds?: ReadonlySet<string>
}

/** Sorting state stored in the query string. */
export function useSortFromQueryString(
  defaultSort: SortingState,
  { fieldName = 'sort', sortableIds }: SortFromQueryStringOptions = {},
) {
  const searchParams = useSearchParams()
  const searchNavigate = useSearchNavigate(searchParams)
  const sort = useMemo(
    () => parseSort(searchParams, defaultSort, fieldName, sortableIds),
    [defaultSort, fieldName, searchParams, sortableIds],
  )
  const onChange: OnChangeFn<SortingState> = useCallback(
    newSort =>
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

function parseSort(
  search: URLSearchParams,
  defaultSort: SortingState,
  fieldName: string,
  sortableIds: ReadonlySet<string> | undefined,
) {
  const sort = search
    .getAll(fieldName)
    .map(id => (id.startsWith('-') ? { id: id.slice(1), desc: true } : { id, desc: false }))
    .filter(({ id }) => !sortableIds || sortableIds.has(id))
  return sort.length ? sort : defaultSort.map(({ id, desc }) => ({ id: id.replace(/\./g, '_'), desc }))
}
