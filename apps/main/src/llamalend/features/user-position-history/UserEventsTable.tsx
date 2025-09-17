import Box from '@mui/material/Box'
import { useReactTable } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { getTableOptions } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DataTable } from '@ui-kit/shared/ui/DataTable/DataTable'
import { EmptyStateRow } from '@ui-kit/shared/ui/DataTable/EmptyStateRow'
import { USER_POSITION_HISTORY_COLUMNS } from './columns'
import { ParsedUserLendCollateralEvent } from './hooks/useUserLendCollateralEvents'

type UserEventsTableProps = {
  events: ParsedUserLendCollateralEvent[]
  isError: boolean
  loading: boolean
}

export const UserEventsTable = ({ events, loading, isError }: UserEventsTableProps) => {
  const table = useReactTable({
    data: events,
    columns: USER_POSITION_HISTORY_COLUMNS,
    ...getTableOptions(events),
  })

  return (
    <Box
      sx={{
        maxHeight: '462px',
        overflow: 'scroll',
        // Override sticky header positioning for scrollable container
        '& thead': {
          top: '0 !important',
        },
      }}
    >
      <DataTable
        table={table}
        emptyState={
          <EmptyStateRow table={table}>{isError ? t`Could not load events` : t`No events found`}</EmptyStateRow>
        }
        loading={loading}
        expandedPanel={() => null} // TODO: fix
        shouldStickFirstColumn={false} // TODO: fix
      />
    </Box>
  )
}
