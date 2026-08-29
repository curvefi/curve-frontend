import { useCallback, useMemo } from 'react'
import { useFilters } from '@evm-ui/shared/ui/DataTable/hooks/useFilters'
import { notFalsy } from '@primitives/objects.utils'
import type { ColumnFiltersState } from '@tanstack/react-table'
import { isProposalStatusFilter, ProposalColumnId, type ProposalStatusFilter } from '../columns'

const PROPOSAL_FILTER_COLUMNS = { Status: ProposalColumnId.Status }

export const useProposalsFilters = () => {
  const { globalFilter, setGlobalFilter, columnFiltersById, setColumnFilter, resetFilters } = useFilters({
    columns: PROPOSAL_FILTER_COLUMNS,
    resetPageOnChange: true,
  })
  const rawStatus = columnFiltersById[ProposalColumnId.Status] ?? null
  const status: ProposalStatusFilter = isProposalStatusFilter(rawStatus) ? rawStatus : 'all'
  const columnFilters = useMemo<ColumnFiltersState>(
    () => notFalsy(status !== 'all' && { id: ProposalColumnId.Status, value: status }),
    [status],
  )
  const setStatus = useCallback(
    (value: ProposalStatusFilter) => setColumnFilter(ProposalColumnId.Status, value === 'all' ? null : value),
    [setColumnFilter],
  )

  return {
    search: globalFilter,
    setSearch: setGlobalFilter,
    status,
    setStatus,
    columnFilters,
    resetFilters,
  }
}
