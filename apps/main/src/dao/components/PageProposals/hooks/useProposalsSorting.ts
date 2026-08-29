import { useCallback, useMemo } from 'react'
import { useSortFromQueryString } from '@evm-ui/hooks/useSortFromQueryString'
import type { OnChangeFn, SortingState } from '@tanstack/react-table'
import { ProposalColumnId, type ProposalSortBy, type ProposalSortDirection } from '../columns'
import type { ProposalsQueryUpdater } from './useProposalsPagination'

const DEFAULT_SORTING = [{ id: ProposalColumnId.TimeCreated, desc: true }] satisfies SortingState
const SORT_COLUMNS: ReadonlySet<string> = new Set([ProposalColumnId.TimeCreated, ProposalColumnId.EndingSoon])

type ProposalSorting = [{ id: ProposalSortBy; desc: boolean }]

const getProposalSorting = (sorting: SortingState): ProposalSorting => {
  const sort = sorting.find(({ id }) => SORT_COLUMNS.has(id))
  return sort
    ? [{ id: sort.id as ProposalSortBy, desc: sort.desc }]
    : [{ id: ProposalColumnId.TimeCreated, desc: true }]
}

export const useProposalsSorting = (updateQueryAndResetPage: ProposalsQueryUpdater) => {
  const [urlSorting] = useSortFromQueryString(DEFAULT_SORTING)
  const sorting = useMemo(() => getProposalSorting(urlSorting), [urlSorting])
  const onSortingChange = useCallback<OnChangeFn<SortingState>>(
    updater => {
      const next = getProposalSorting(typeof updater === 'function' ? updater(sorting) : updater)
      const [{ id, desc }] = next
      const serialized = `${desc ? '-' : ''}${id}`
      updateQueryAndResetPage({ sort: serialized === `-${ProposalColumnId.TimeCreated}` ? null : serialized })
    },
    [sorting, updateQueryAndResetPage],
  )
  const [{ id: sortBy, desc }] = sorting
  const sortDirection: ProposalSortDirection = desc ? 'desc' : 'asc'

  return {
    sorting,
    onSortingChange,
    sortBy,
    sortDirection,
  }
}
