import type { ProposalData } from '@/dao/entities/proposals-mapper'
import { createAppColumnHelper } from '@ui/features/tables/data-table.utils'

export enum ProposalColumnId {
  TimeCreated = 'timeCreated',
  EndingSoon = 'endingSoon',
  Status = 'status',
}

const columnHelper = createAppColumnHelper<ProposalData>()

export const columns = columnHelper.columns([
  columnHelper.accessor('timestamp', { id: ProposalColumnId.TimeCreated }),
  columnHelper.accessor(proposal => (proposal.status === 'Active' ? proposal.timestamp : undefined), {
    id: ProposalColumnId.EndingSoon,
    sortUndefined: 'last',
    invertSorting: true,
  }),
  columnHelper.accessor('status', {
    id: ProposalColumnId.Status,
    filterFn: (row, _columnId, value) => {
      if (value === 'all') return true
      if (value === 'executable') return row.original.status === 'Passed' && !row.original.executed
      if (value === 'executed') return row.original.executed
      return row.original.status.toLowerCase() === value
    },
    enableSorting: false,
  }),
])
