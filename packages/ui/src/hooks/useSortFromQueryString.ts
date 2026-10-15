import { useCallback, useMemo } from 'react'
import { notFalsy } from '@primitives/objects.utils'
import type { ColumnDef, OnChangeFn, RowData, SortingState } from '@tanstack/react-table'
import type { CurveTableFeatures } from '@ui/features/tables/data-table.utils'
import { useSearchNavigate, useSearchParams } from '@ui/hooks/router'

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- same as TanStack's column helper
type CurveColumnDefs<TData extends RowData> = readonly ColumnDef<CurveTableFeatures, TData, any>[]

type SortFromQueryStringOptions<TData extends RowData> = {
  /** Query string key holding the sort */
  fieldName?: string
  /** Table columns: sort entries for columns that can't be sorted are ignored */
  columns: CurveColumnDefs<TData>
}

/** Sorting state stored in the query string. */
export function useSortFromQueryString<TData extends RowData>(
  defaultSort: SortingState,
  { fieldName = 'sort', columns }: SortFromQueryStringOptions<TData>,
) {
  const sortableIds = useMemo(() => getSortableColumnIds(columns), [columns])
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
  sortableIds: ReadonlySet<string>,
) {
  const sort = search
    .getAll(fieldName)
    .map(id => (id.startsWith('-') ? { id: id.slice(1), desc: true } : { id, desc: false }))
    .filter(({ id }) => sortableIds.has(id))
  return sort.length ? sort : defaultSort.map(({ id, desc }) => ({ id: id.replace(/\./g, '_'), desc }))
}

const getSortableColumnIds = <TData extends RowData>(columns: CurveColumnDefs<TData>): ReadonlySet<string> =>
  new Set(
    notFalsy(
      ...columns
        .filter(column => column.enableSorting !== false && ('accessorFn' in column || 'accessorKey' in column))
        .map(column => column.id ?? ('accessorKey' in column ? String(column.accessorKey).replaceAll('.', '_') : null)),
    ),
  )
