import type { ProposalData } from '@/dao/entities/proposals'
import { createAppColumnHelper, type CurveTableFeatures } from '@evm-ui/shared/ui/DataTable/data-table.utils'
import type { FilterFn, Row } from '@tanstack/react-table'
import { ProposalColumnId, type ProposalSortDirection, type ProposalStatusFilter } from './columns.enum'

const columnHelper = createAppColumnHelper<ProposalData>()
const STATUS_FILTERS: ReadonlySet<string> = new Set(['active', 'passed', 'executable', 'denied'])

export const isProposalStatusFilter = (value: string | null): value is Exclude<ProposalStatusFilter, 'all'> =>
  value != null && STATUS_FILTERS.has(value)

export const proposalStatusFilterFn: FilterFn<CurveTableFeatures, ProposalData> = (row, _columnId, value) => {
  const status = value as ProposalStatusFilter

  if (status === 'all') return true
  if (status === 'executable') return row.original.status === 'Passed' && !row.original.executed

  return row.original.status.toLowerCase() === status
}

/**
 * Active proposals always precede inactive proposals. Only the active segment
 * responds to the selected direction; inactive proposals remain newest-first.
 * TanStack reverses custom comparators for descending state, so the comparator
 * compensates to keep the active-first grouping and inactive ordering stable.
 */
export const createEndingSoonSortFn =
  (direction: ProposalSortDirection) =>
  (a: Row<CurveTableFeatures, ProposalData>, b: Row<CurveTableFeatures, ProposalData>) => {
    const aIsActive = a.original.status === 'Active'
    const bIsActive = b.original.status === 'Active'
    const desiredOrder =
      aIsActive !== bIsActive
        ? aIsActive
          ? -1
          : 1
        : aIsActive
          ? direction === 'asc'
            ? b.original.timestamp - a.original.timestamp
            : a.original.timestamp - b.original.timestamp
          : b.original.timestamp - a.original.timestamp

    return direction === 'desc' ? -desiredOrder : desiredOrder
  }

export const createProposalColumns = (sortDirection: ProposalSortDirection) =>
  columnHelper.columns([
    columnHelper.accessor('timestamp', { id: ProposalColumnId.TimeCreated }),
    columnHelper.accessor('timestamp', {
      id: ProposalColumnId.EndingSoon,
      sortFn: createEndingSoonSortFn(sortDirection),
    }),
    columnHelper.accessor('status', {
      id: ProposalColumnId.Status,
      filterFn: proposalStatusFilterFn,
      enableSorting: false,
    }),
  ])
